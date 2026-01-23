#!/usr/bin/env python3
"""
Content Pipeline CLI

End-to-end content generation pipeline with multi-model support.
Orchestrates generation, optimization, review, and publishing.

Usage:
    python content_pipeline.py generate --type blog --topic "Topic here"
    python content_pipeline.py bulk --input requests.json --output ./output
    python content_pipeline.py review --file content.md --type blog
    python content_pipeline.py status
"""

import os
import sys
import json
import time
import logging
import argparse
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field, asdict
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add skill script paths
SCRIPT_DIR = Path(__file__).parent
SKILL_DIR = SCRIPT_DIR.parent / "skills"
sys.path.insert(0, str(SKILL_DIR / "multi-model-connector" / "scripts"))
sys.path.insert(0, str(SKILL_DIR / "content-review" / "scripts"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


@dataclass
class ContentRequest:
    """Content generation request."""
    id: str
    content_type: str
    topic: str
    context: Dict[str, Any] = field(default_factory=dict)
    template: Optional[str] = None


@dataclass
class ContentResult:
    """Content generation result."""
    id: str
    content_type: str
    status: str  # success, failed, review_failed
    content: str
    model_used: str
    review_score: int
    revision_count: int
    tokens_used: int
    latency_ms: float
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ContentPipeline:
    """
    End-to-end content generation pipeline.

    Coordinates:
    - Multi-model content generation
    - Content optimization
    - GPT-4 quality review
    - Revision iterations
    - Publishing format conversion
    """

    def __init__(self, config_path: Optional[str] = None):
        """Initialize the pipeline."""
        self._connector_manager = None
        self._content_reviewer = None
        self.metrics = {
            "total_requests": 0,
            "successful": 0,
            "failed": 0,
            "total_tokens": 0,
            "total_latency_ms": 0,
            "model_usage": {},
            "avg_review_score": 0,
            "review_scores": []
        }

    def _get_connector_manager(self):
        """Lazy load connector manager."""
        if self._connector_manager is None:
            try:
                from connector_manager import ConnectorManager
                self._connector_manager = ConnectorManager()
            except ImportError as e:
                logger.error(f"Failed to import ConnectorManager: {e}")
                raise
        return self._connector_manager

    def _get_content_reviewer(self):
        """Lazy load content reviewer."""
        if self._content_reviewer is None:
            try:
                from content_reviewer import ContentReviewer
                self._content_reviewer = ContentReviewer()
            except ImportError as e:
                logger.error(f"Failed to import ContentReviewer: {e}")
                raise
        return self._content_reviewer

    def generate(
        self,
        content_type: str,
        topic: str,
        context: Optional[Dict[str, Any]] = None,
        template: Optional[str] = None,
        with_review: bool = True,
        auto_revise: bool = True,
        max_revisions: int = 2
    ) -> ContentResult:
        """
        Generate content with full pipeline.

        Args:
            content_type: Type of content (blog, landing, faq, product)
            topic: Content topic/subject
            context: Additional context (industry, tone, keywords, language)
            template: Template to use (optional)
            with_review: Run GPT-4 review
            auto_revise: Automatically revise if review fails
            max_revisions: Maximum revision iterations

        Returns:
            ContentResult with generated content and metadata
        """
        request_id = f"{content_type}_{int(time.time() * 1000)}"
        context = context or {}
        start_time = time.time()

        self.metrics["total_requests"] += 1

        try:
            manager = self._get_connector_manager()
            reviewer = self._get_content_reviewer()

            # Build prompt
            prompt = self._build_prompt(content_type, topic, context, template)

            # Generate content
            logger.info(f"Generating {content_type} content: {topic[:50]}...")
            response = manager.generate(
                content_type=content_type,
                prompt=prompt,
                context=context
            )

            if not response.success:
                return self._create_failure_result(
                    request_id, content_type, response.error, start_time
                )

            content = response.content
            model_used = response.model
            total_tokens = response.tokens_used
            revision_count = 0
            review_score = 0

            # Review if requested
            if with_review:
                review_result = reviewer.review(content, content_type)
                review_score = review_result.overall_score

                logger.info(f"Review score: {review_score}, Passed: {review_result.passed}")

                # Revise if needed
                if auto_revise and not review_result.passed:
                    while revision_count < max_revisions and not review_result.passed:
                        revision_count += 1
                        logger.info(f"Revising content (iteration {revision_count})...")

                        # Get revision
                        feedback = review_result.improvements + [
                            f"Critical: {issue}"
                            for issue in review_result.critical_issues
                        ]
                        revision = manager.revise(
                            content=content,
                            feedback=feedback,
                            content_type=content_type
                        )

                        if revision.success:
                            content = revision.content
                            total_tokens += revision.tokens_used

                            # Re-review
                            review_result = reviewer.review(content, content_type)
                            review_score = review_result.overall_score
                            logger.info(f"Revision {revision_count} score: {review_score}")
                        else:
                            logger.warning(f"Revision failed: {revision.error}")
                            break

            # Calculate latency
            latency_ms = (time.time() - start_time) * 1000

            # Update metrics
            self.metrics["successful"] += 1
            self.metrics["total_tokens"] += total_tokens
            self.metrics["total_latency_ms"] += latency_ms
            self.metrics["model_usage"][model_used] = \
                self.metrics["model_usage"].get(model_used, 0) + 1
            if review_score > 0:
                self.metrics["review_scores"].append(review_score)

            return ContentResult(
                id=request_id,
                content_type=content_type,
                status="success",
                content=content,
                model_used=model_used,
                review_score=review_score,
                revision_count=revision_count,
                tokens_used=total_tokens,
                latency_ms=latency_ms,
                metadata={
                    "topic": topic,
                    "with_review": with_review,
                    "auto_revise": auto_revise,
                    "used_fallback": response.metadata.get("used_fallback", False)
                }
            )

        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            return self._create_failure_result(
                request_id, content_type, str(e), start_time
            )

    def bulk_generate(
        self,
        requests: List[ContentRequest],
        parallel: int = 1,
        with_review: bool = True,
        auto_revise: bool = True
    ) -> List[ContentResult]:
        """
        Generate multiple pieces of content.

        Args:
            requests: List of ContentRequest objects
            parallel: Number of parallel workers (1 = sequential)
            with_review: Run GPT-4 review on each
            auto_revise: Automatically revise if needed

        Returns:
            List of ContentResult objects
        """
        results = []

        if parallel <= 1:
            # Sequential processing
            for i, request in enumerate(requests):
                logger.info(f"Processing {i+1}/{len(requests)}: {request.topic[:30]}...")
                result = self.generate(
                    content_type=request.content_type,
                    topic=request.topic,
                    context=request.context,
                    template=request.template,
                    with_review=with_review,
                    auto_revise=auto_revise
                )
                result.id = request.id
                results.append(result)
        else:
            # Parallel processing
            with ThreadPoolExecutor(max_workers=parallel) as executor:
                future_to_request = {
                    executor.submit(
                        self.generate,
                        request.content_type,
                        request.topic,
                        request.context,
                        request.template,
                        with_review,
                        auto_revise
                    ): request
                    for request in requests
                }

                for future in as_completed(future_to_request):
                    request = future_to_request[future]
                    try:
                        result = future.result()
                        result.id = request.id
                        results.append(result)
                        logger.info(f"Completed: {request.id} - {result.status}")
                    except Exception as e:
                        logger.error(f"Failed: {request.id} - {e}")
                        results.append(ContentResult(
                            id=request.id,
                            content_type=request.content_type,
                            status="failed",
                            content="",
                            model_used="none",
                            review_score=0,
                            revision_count=0,
                            tokens_used=0,
                            latency_ms=0,
                            error=str(e)
                        ))

        return results

    def review_content(
        self,
        content: str,
        content_type: str = "default",
        threshold: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Review existing content without generation.

        Args:
            content: Content to review
            content_type: Type of content
            threshold: Custom pass threshold

        Returns:
            Review result dict
        """
        reviewer = self._get_content_reviewer()
        result = reviewer.review(content, content_type, threshold=threshold)
        return result.to_dict()

    def get_status(self) -> Dict[str, Any]:
        """Get pipeline status and model availability."""
        manager = self._get_connector_manager()
        available = manager.get_available_models()

        return {
            "models": available,
            "all_available": all(available.values()),
            "metrics": self.get_metrics()
        }

    def get_metrics(self) -> Dict[str, Any]:
        """Get pipeline metrics summary."""
        avg_score = 0
        if self.metrics["review_scores"]:
            avg_score = sum(self.metrics["review_scores"]) / len(self.metrics["review_scores"])

        return {
            "total_requests": self.metrics["total_requests"],
            "successful": self.metrics["successful"],
            "failed": self.metrics["failed"],
            "success_rate": (
                self.metrics["successful"] / self.metrics["total_requests"] * 100
                if self.metrics["total_requests"] > 0 else 0
            ),
            "total_tokens": self.metrics["total_tokens"],
            "avg_latency_ms": (
                self.metrics["total_latency_ms"] / self.metrics["successful"]
                if self.metrics["successful"] > 0 else 0
            ),
            "avg_review_score": round(avg_score, 1),
            "model_usage": self.metrics["model_usage"]
        }

    def _build_prompt(
        self,
        content_type: str,
        topic: str,
        context: Dict[str, Any],
        template: Optional[str]
    ) -> str:
        """Build generation prompt."""
        prompt_parts = []

        # Add template if provided
        if template:
            prompt_parts.append(f"Use this template structure:\n{template}\n")

        # Content type specific instructions
        type_instructions = {
            "blog": "Write a comprehensive, SEO-optimized blog post with proper heading hierarchy, engaging introduction, and clear conclusion with CTA.",
            "landing": "Create a conversion-focused landing page with compelling headline, benefit-focused sections, social proof, and strong CTA.",
            "faq": "Create a comprehensive FAQ section with common questions and detailed, helpful answers.",
            "product": "Write a compelling product description highlighting features, benefits, and value proposition.",
            "service": "Create a professional service page explaining offerings, benefits, process, and qualifications."
        }

        prompt_parts.append(type_instructions.get(content_type, "Create high-quality content."))

        # Add topic
        prompt_parts.append(f"\nTopic: {topic}")

        # Add context
        if context.get("industry"):
            prompt_parts.append(f"Industry: {context['industry']}")
        if context.get("language"):
            prompt_parts.append(f"Language: {context['language']}")
        if context.get("tone"):
            prompt_parts.append(f"Tone: {context['tone']}")
        if context.get("keywords"):
            prompt_parts.append(f"Keywords to include: {', '.join(context['keywords'])}")
        if context.get("word_count"):
            prompt_parts.append(f"Target word count: {context['word_count']}")

        return "\n".join(prompt_parts)

    def _create_failure_result(
        self,
        request_id: str,
        content_type: str,
        error: str,
        start_time: float
    ) -> ContentResult:
        """Create a failure result."""
        self.metrics["failed"] += 1
        return ContentResult(
            id=request_id,
            content_type=content_type,
            status="failed",
            content="",
            model_used="none",
            review_score=0,
            revision_count=0,
            tokens_used=0,
            latency_ms=(time.time() - start_time) * 1000,
            error=error
        )


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Content Pipeline CLI - Multi-model content generation"
    )
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Generate command
    gen_parser = subparsers.add_parser("generate", help="Generate single content")
    gen_parser.add_argument("--type", "-t", required=True, help="Content type")
    gen_parser.add_argument("--topic", required=True, help="Content topic")
    gen_parser.add_argument("--context", "-c", help="JSON context string")
    gen_parser.add_argument("--template", help="Template file path")
    gen_parser.add_argument("--no-review", action="store_true", help="Skip review")
    gen_parser.add_argument("--no-revise", action="store_true", help="Skip auto-revision")
    gen_parser.add_argument("--output", "-o", help="Output file")

    # Bulk command
    bulk_parser = subparsers.add_parser("bulk", help="Bulk content generation")
    bulk_parser.add_argument("--input", "-i", required=True, help="Input JSON file")
    bulk_parser.add_argument("--output", "-o", required=True, help="Output directory")
    bulk_parser.add_argument("--parallel", "-p", type=int, default=1, help="Parallel workers")
    bulk_parser.add_argument("--no-review", action="store_true", help="Skip review")

    # Review command
    review_parser = subparsers.add_parser("review", help="Review existing content")
    review_parser.add_argument("--file", "-f", required=True, help="Content file")
    review_parser.add_argument("--type", "-t", default="default", help="Content type")
    review_parser.add_argument("--threshold", type=int, help="Pass threshold")

    # Status command
    subparsers.add_parser("status", help="Check pipeline status")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    pipeline = ContentPipeline()

    if args.command == "generate":
        context = {}
        if args.context:
            context = json.loads(args.context)

        template = None
        if args.template:
            with open(args.template, "r", encoding="utf-8") as f:
                template = f.read()

        result = pipeline.generate(
            content_type=args.type,
            topic=args.topic,
            context=context,
            template=template,
            with_review=not args.no_review,
            auto_revise=not args.no_revise
        )

        print(f"\n{'='*60}")
        print(f"Status: {result.status}")
        print(f"Model: {result.model_used}")
        print(f"Review Score: {result.review_score}")
        print(f"Revisions: {result.revision_count}")
        print(f"Tokens: {result.tokens_used}")
        print(f"Latency: {result.latency_ms:.0f}ms")
        print(f"{'='*60}\n")

        if result.status == "success":
            print(result.content)

            if args.output:
                with open(args.output, "w", encoding="utf-8") as f:
                    f.write(result.content)
                print(f"\nSaved to {args.output}")
        else:
            print(f"Error: {result.error}")

    elif args.command == "bulk":
        # Load requests
        with open(args.input, "r", encoding="utf-8") as f:
            raw_requests = json.load(f)

        requests = [
            ContentRequest(
                id=r.get("id", f"req_{i}"),
                content_type=r["content_type"],
                topic=r["topic"],
                context=r.get("context", {}),
                template=r.get("template")
            )
            for i, r in enumerate(raw_requests)
        ]

        print(f"Processing {len(requests)} requests...")

        results = pipeline.bulk_generate(
            requests=requests,
            parallel=args.parallel,
            with_review=not args.no_review
        )

        # Create output directory
        output_dir = Path(args.output)
        output_dir.mkdir(parents=True, exist_ok=True)

        # Save results
        for result in results:
            if result.status == "success":
                output_file = output_dir / f"{result.id}.md"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(result.content)

        # Save summary
        summary = {
            "timestamp": datetime.now().isoformat(),
            "total": len(results),
            "successful": sum(1 for r in results if r.status == "success"),
            "failed": sum(1 for r in results if r.status == "failed"),
            "results": [r.to_dict() for r in results],
            "metrics": pipeline.get_metrics()
        }

        summary_file = output_dir / "summary.json"
        with open(summary_file, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        print(f"\nCompleted: {summary['successful']}/{summary['total']} successful")
        print(f"Results saved to {output_dir}")

    elif args.command == "review":
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read()

        result = pipeline.review_content(
            content=content,
            content_type=args.type,
            threshold=args.threshold
        )

        print(json.dumps(result, indent=2, ensure_ascii=False))

    elif args.command == "status":
        status = pipeline.get_status()
        print("\n=== Pipeline Status ===\n")
        print("Model Availability:")
        for model, available in status["models"].items():
            status_icon = "✓" if available else "✗"
            print(f"  {status_icon} {model}")
        print(f"\nAll models available: {status['all_available']}")
        print("\nMetrics:")
        print(json.dumps(status["metrics"], indent=2))


if __name__ == "__main__":
    main()
