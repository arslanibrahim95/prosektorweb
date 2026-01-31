"""
Content Reviewer

GPT-4 powered content quality assessment and revision workflow.
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field

# Add parent paths for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "multi-model-connector" / "scripts"))

logger = logging.getLogger(__name__)


@dataclass
class ReviewResult:
    """Review result data structure."""
    success: bool
    overall_score: int
    criteria_scores: Dict[str, Dict[str, Any]]
    strengths: List[str]
    improvements: List[str]
    critical_issues: List[str]
    recommendation: str  # approve, revise, reject
    passed: bool
    revision_count: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "overall_score": self.overall_score,
            "criteria_scores": self.criteria_scores,
            "strengths": self.strengths,
            "improvements": self.improvements,
            "critical_issues": self.critical_issues,
            "recommendation": self.recommendation,
            "passed": self.passed,
            "revision_count": self.revision_count,
            "metadata": self.metadata
        }


class ContentReviewer:
    """
    Content review and quality assessment using GPT-4.

    Provides systematic evaluation of AI-generated content
    with actionable feedback and revision support.
    """

    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the content reviewer.

        Args:
            config_path: Path to content-thresholds.json
        """
        self.config = self._load_config(config_path)
        self._connector_manager = None

    def _load_config(self, config_path: Optional[str] = None) -> Dict[str, Any]:
        """Load threshold configuration."""
        if config_path is None:
            config_path = Path(__file__).parent.parent / "config" / "content-thresholds.json"

        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config not found at {config_path}, using defaults")
            return self._default_config()

    def _default_config(self) -> Dict[str, Any]:
        """Return default configuration."""
        return {
            "default_threshold": 70,
            "max_revision_iterations": 2,
            "content_types": {
                "default": {
                    "threshold": 70,
                    "criteria": ["accuracy", "clarity", "tone", "seo", "engagement"],
                    "weights": {
                        "accuracy": 0.20,
                        "clarity": 0.20,
                        "tone": 0.15,
                        "seo": 0.15,
                        "engagement": 0.15,
                        "eeat": 0.15
                    }
                }
            }
        }

    def _get_connector_manager(self):
        """Lazy load connector manager."""
        if self._connector_manager is None:
            try:
                from connector_manager import ConnectorManager
                self._connector_manager = ConnectorManager()
            except ImportError:
                raise ImportError(
                    "connector_manager not available. "
                    "Ensure multi-model-connector skill is installed."
                )
        return self._connector_manager

    def review(
        self,
        content: str,
        content_type: str = "default",
        criteria: Optional[List[str]] = None,
        threshold: Optional[int] = None
    ) -> ReviewResult:
        """
        Review content and provide quality assessment.

        Args:
            content: The content to review
            content_type: Type of content (blog, landing, faq, etc.)
            criteria: Custom criteria to evaluate (optional)
            threshold: Custom pass threshold (optional)

        Returns:
            ReviewResult with scores and feedback
        """
        # Get type-specific config
        type_config = self.config.get("content_types", {}).get(
            content_type,
            self.config.get("content_types", {}).get("default", {})
        )

        # Determine criteria and threshold
        review_criteria = criteria or type_config.get(
            "criteria",
            ["accuracy", "clarity", "tone", "seo", "engagement"]
        )
        pass_threshold = threshold or type_config.get(
            "threshold",
            self.config.get("default_threshold", 70)
        )

        # Get connector manager and perform review
        manager = self._get_connector_manager()
        raw_result = manager.review(
            content=content,
            criteria=review_criteria,
            content_type=content_type
        )

        if not raw_result.get("success", False):
            return ReviewResult(
                success=False,
                overall_score=0,
                criteria_scores={},
                strengths=[],
                improvements=[],
                critical_issues=[raw_result.get("error", "Review failed")],
                recommendation="reject",
                passed=False,
                metadata={"error": raw_result.get("error")}
            )

        # Calculate weighted score
        weights = type_config.get("weights", {})
        overall_score = raw_result.get("overall_score", 0)

        if weights and raw_result.get("criteria_scores"):
            weighted_sum = 0
            total_weight = 0
            for criterion, score_data in raw_result.get("criteria_scores", {}).items():
                weight = weights.get(criterion, 0.1)
                weighted_sum += score_data.get("score", 0) * weight
                total_weight += weight
            if total_weight > 0:
                overall_score = int(weighted_sum / total_weight)

        # Check critical criteria
        critical_criteria = type_config.get("critical_criteria", [])
        critical_failed = False
        critical_issues = raw_result.get("critical_issues", [])

        for criterion in critical_criteria:
            if criterion in raw_result.get("criteria_scores", {}):
                score = raw_result["criteria_scores"][criterion].get("score", 0)
                min_score = self.config.get("criteria_definitions", {}).get(
                    criterion, {}
                ).get("min_score_for_pass", 60)
                if score < min_score:
                    critical_failed = True
                    critical_issues.append(
                        f"Critical criterion '{criterion}' below minimum ({score} < {min_score})"
                    )

        # Determine pass status
        passed = overall_score >= pass_threshold and not critical_failed

        # Determine recommendation
        if critical_failed or overall_score < 60:
            recommendation = "reject"
        elif overall_score < pass_threshold:
            recommendation = "revise"
        else:
            recommendation = "approve"

        return ReviewResult(
            success=True,
            overall_score=overall_score,
            criteria_scores=raw_result.get("criteria_scores", {}),
            strengths=raw_result.get("strengths", []),
            improvements=raw_result.get("improvements", []),
            critical_issues=critical_issues,
            recommendation=recommendation,
            passed=passed,
            metadata={
                "content_type": content_type,
                "threshold": pass_threshold,
                "criteria_used": review_criteria
            }
        )

    def revise_content(
        self,
        content: str,
        feedback: List[str],
        content_type: str = "default",
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Revise content based on review feedback.

        Args:
            content: Original content
            feedback: List of improvements to make
            content_type: Type of content
            model: Model to use for revision

        Returns:
            Revised content and metadata
        """
        manager = self._get_connector_manager()
        result = manager.revise(
            content=content,
            feedback=feedback,
            content_type=content_type,
            model=model
        )

        return {
            "success": result.success,
            "content": result.content,
            "model": result.model,
            "tokens_used": result.tokens_used,
            "error": result.error
        }

    def review_and_revise(
        self,
        content: str,
        content_type: str = "default",
        max_iterations: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Review content and revise if needed, up to max iterations.

        Args:
            content: Content to review and potentially revise
            content_type: Type of content
            max_iterations: Maximum revision attempts

        Returns:
            Final content, review history, and status
        """
        max_iter = max_iterations or self.config.get("max_revision_iterations", 2)
        current_content = content
        history = []
        iteration = 0

        while iteration <= max_iter:
            # Review current content
            review = self.review(current_content, content_type)
            history.append({
                "iteration": iteration,
                "score": review.overall_score,
                "passed": review.passed,
                "recommendation": review.recommendation
            })

            if review.passed:
                return {
                    "success": True,
                    "content": current_content,
                    "final_score": review.overall_score,
                    "iterations": iteration,
                    "history": history,
                    "review": review.to_dict()
                }

            if iteration >= max_iter:
                break

            # Revise based on feedback
            feedback = review.improvements + [
                f"Critical: {issue}" for issue in review.critical_issues
            ]

            revision_result = self.revise_content(
                content=current_content,
                feedback=feedback,
                content_type=content_type
            )

            if not revision_result["success"]:
                return {
                    "success": False,
                    "content": current_content,
                    "final_score": review.overall_score,
                    "iterations": iteration,
                    "history": history,
                    "error": revision_result["error"]
                }

            current_content = revision_result["content"]
            iteration += 1

        # Max iterations reached without passing
        return {
            "success": False,
            "content": current_content,
            "final_score": history[-1]["score"] if history else 0,
            "iterations": iteration,
            "history": history,
            "error": "Max revision iterations reached without passing threshold"
        }

    def batch_review(
        self,
        contents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Review multiple pieces of content.

        Args:
            contents: List of {"content": str, "content_type": str, "id": str}

        Returns:
            List of review results with IDs
        """
        results = []
        for item in contents:
            review = self.review(
                content=item.get("content", ""),
                content_type=item.get("content_type", "default")
            )
            results.append({
                "id": item.get("id"),
                "content_type": item.get("content_type"),
                "review": review.to_dict()
            })
        return results

    def get_criteria_info(self, criterion: str) -> Dict[str, Any]:
        """Get information about a review criterion."""
        return self.config.get("criteria_definitions", {}).get(criterion, {})

    def get_content_type_config(self, content_type: str) -> Dict[str, Any]:
        """Get configuration for a content type."""
        return self.config.get("content_types", {}).get(
            content_type,
            self.config.get("content_types", {}).get("default", {})
        )


# CLI usage
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Content quality reviewer")
    parser.add_argument("--file", "-f", help="File to review")
    parser.add_argument("--content", "-c", help="Content string to review")
    parser.add_argument("--type", "-t", default="default", help="Content type")
    parser.add_argument("--threshold", type=int, help="Pass threshold")
    parser.add_argument("--revise", "-r", action="store_true", help="Auto-revise if needed")
    parser.add_argument("--output", "-o", help="Output file for results")

    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)

    # Get content
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read()
    elif args.content:
        content = args.content
    else:
        print("Error: Provide --file or --content")
        sys.exit(1)

    reviewer = ContentReviewer()

    if args.revise:
        result = reviewer.review_and_revise(
            content=content,
            content_type=args.type
        )
    else:
        result = reviewer.review(
            content=content,
            content_type=args.type,
            threshold=args.threshold
        ).to_dict()

    print(json.dumps(result, indent=2, ensure_ascii=False))

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"\nResults saved to {args.output}")
