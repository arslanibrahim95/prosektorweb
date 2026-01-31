# CI/CD Integration

> Guide for integrating Quality Gate into CI/CD pipelines.

---

## 1. GitHub Actions

### Basic Integration
```yaml
name: Quality Gate

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci

      - name: Run Quality Gate
        run: |
          python scripts/checklist.py . --json > quality-report.json

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: quality-report
          path: quality-report.json
```

### With Staging URL (Full Suite)
```yaml
jobs:
  deploy-staging:
    # ... deploy to staging ...
    outputs:
      url: ${{ steps.deploy.outputs.url }}

  quality-gate:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Full Quality Gate
        run: |
          python scripts/checklist.py . \
            --url ${{ needs.deploy-staging.outputs.url }} \
            --json > quality-report.json

      - name: Check Results
        run: |
          if jq -e '.summary.gate_passed == false' quality-report.json; then
            echo "Quality gate failed!"
            exit 1
          fi
```

---

## 2. GitLab CI

```yaml
quality-gate:
  stage: test
  image: python:3.11
  script:
    - pip install -r requirements.txt
    - python scripts/checklist.py . --json > quality-report.json
  artifacts:
    when: always
    reports:
      dotenv: quality-report.json
    paths:
      - quality-report.json
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"
```

---

## 3. Jenkins

```groovy
pipeline {
    agent any

    stages {
        stage('Quality Gate') {
            steps {
                sh '''
                    python scripts/checklist.py . --json > quality-report.json
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'quality-report.json'
                }
            }
        }
    }

    post {
        failure {
            script {
                def report = readJSON file: 'quality-report.json'
                if (!report.summary.gate_passed) {
                    error "Quality gate failed: ${report.summary.blocking_failures} blocking issues"
                }
            }
        }
    }
}
```

---

## 4. Azure DevOps

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: UsePythonVersion@0
    inputs:
      versionSpec: '3.11'

  - script: |
      python scripts/checklist.py . --json > $(Build.ArtifactStagingDirectory)/quality-report.json
    displayName: 'Run Quality Gate'

  - task: PublishBuildArtifacts@1
    condition: always()
    inputs:
      pathToPublish: '$(Build.ArtifactStagingDirectory)'
      artifactName: 'quality-report'
```

---

## 5. CircleCI

```yaml
version: 2.1

jobs:
  quality-gate:
    docker:
      - image: cimg/python:3.11
    steps:
      - checkout
      - run:
          name: Run Quality Gate
          command: |
            python scripts/checklist.py . --json > quality-report.json
      - store_artifacts:
          path: quality-report.json

workflows:
  main:
    jobs:
      - quality-gate
```

---

## 6. Exit Codes

| Code | Meaning | CI Action |
|------|---------|-----------|
| 0 | Gate passed | Continue pipeline |
| 1 | Gate failed | Block deployment |

---

## 7. Parsing JSON Output

### Structure
```json
{
  "summary": {
    "gate_passed": true,
    "blocking_failures": 0,
    "total_checks": 10,
    "passed_checks": 8,
    "failed_checks": 2,
    "skipped_checks": 0
  },
  "checks": [
    {
      "name": "security",
      "passed": true,
      "blocking": true,
      "evaluation": {
        "meets_threshold": true,
        "issues": []
      }
    }
  ]
}
```

### jq Examples
```bash
# Check if passed
jq '.summary.gate_passed' quality-report.json

# Get failed checks
jq '.checks[] | select(.passed == false) | .name' quality-report.json

# Get blocking issues
jq '.checks[] | select(.blocking and .passed == false)' quality-report.json
```

---

## 8. Best Practices

1. **Run blocking checks on every PR**
2. **Run full suite on merge to main**
3. **Store reports as artifacts**
4. **Set up notifications for failures**
5. **Use project-local config for consistency**

---

> **Tip:** Start with lenient thresholds, then tighten as codebase matures.
