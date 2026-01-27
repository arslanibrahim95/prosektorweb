#!/bin/bash
#
# AI CLI Tools Setup for macOS
# Installs and configures CLI tools for the AI Pipeline
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================"
echo "AI CLI ARACLARINI KURULUM"
echo "========================================${NC}"
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Homebrew bulunamadi. Kuruluyor...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm bulunamadi. Node.js yukleyin: brew install node${NC}"
    exit 1
fi

echo -e "\n${BLUE}1. Claude CLI (Anthropic)${NC}"
echo "----------------------------------------"
if ! command -v claude &> /dev/null; then
    echo "Kuruluyor: npm install -g @anthropic-ai/claude-code"
    npm install -g @anthropic-ai/claude-code
else
    echo -e "${GREEN}Claude CLI zaten yuklu.${NC}"
fi

echo -e "\n${BLUE}2. Codex CLI (OpenAI)${NC}"
echo "----------------------------------------"
if ! command -v codex &> /dev/null; then
    echo "Kuruluyor: npm install -g @openai/codex"
    npm install -g @openai/codex 2>/dev/null || echo -e "${YELLOW}Codex CLI opsiyonel - openai CLI kullanilabilir${NC}"
else
    echo -e "${GREEN}Codex CLI zaten yuklu.${NC}"
fi

echo -e "\n${BLUE}3. OpenAI CLI${NC}"
echo "----------------------------------------"
if ! command -v openai &> /dev/null; then
    echo "Kuruluyor: pip3 install openai"
    pip3 install openai
else
    echo -e "${GREEN}OpenAI CLI zaten yuklu.${NC}"
fi

echo -e "\n${BLUE}4. Gemini CLI (Google AI)${NC}"
echo "----------------------------------------"
if ! command -v gemini &> /dev/null; then
    echo "Kuruluyor: pip3 install google-generativeai"
    pip3 install google-generativeai

    # Create gemini wrapper script
    echo -e "${YELLOW}Gemini CLI wrapper olusturuluyor...${NC}"
    cat > /usr/local/bin/gemini << 'GEMINI_EOF'
#!/usr/bin/env python3
import sys
import os
import google.generativeai as genai

def main():
    api_key = os.environ.get('GOOGLE_AI_API_KEY')
    if not api_key:
        print("Error: GOOGLE_AI_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    genai.configure(api_key=api_key)

    # Parse arguments
    args = sys.argv[1:]
    model_name = "gemini-2.0-flash"
    system_prompt = ""

    i = 0
    while i < len(args):
        if args[i] == "chat":
            i += 1
        elif args[i] == "--model" and i + 1 < len(args):
            model_name = args[i + 1]
            i += 2
        elif args[i] == "--system" and i + 1 < len(args):
            system_prompt = args[i + 1]
            i += 2
        else:
            i += 1

    # Read input from stdin
    user_input = sys.stdin.read().strip()

    # Create model
    model = genai.GenerativeModel(model_name)

    # Generate content
    prompt = f"{system_prompt}\n\n{user_input}" if system_prompt else user_input
    response = model.generate_content(prompt)

    print(response.text)

if __name__ == "__main__":
    main()
GEMINI_EOF
    chmod +x /usr/local/bin/gemini
    echo -e "${GREEN}Gemini CLI wrapper olusturuldu.${NC}"
else
    echo -e "${GREEN}Gemini CLI zaten yuklu.${NC}"
fi

echo -e "\n${BLUE}5. GLM CLI (ZhipuAI)${NC}"
echo "----------------------------------------"
if ! command -v glm &> /dev/null; then
    echo "Kuruluyor: pip3 install zhipuai"
    pip3 install zhipuai

    # Create GLM wrapper script
    echo -e "${YELLOW}GLM CLI wrapper olusturuluyor...${NC}"
    cat > /usr/local/bin/glm << 'GLM_EOF'
#!/usr/bin/env python3
import sys
import os
from zhipuai import ZhipuAI

def main():
    api_key = os.environ.get('ZHIPU_API_KEY')
    if not api_key:
        print("Error: ZHIPU_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    client = ZhipuAI(api_key=api_key)

    # Parse arguments
    args = sys.argv[1:]
    model_name = "glm-4-plus"
    system_prompt = ""

    i = 0
    while i < len(args):
        if args[i] == "chat":
            i += 1
        elif args[i] == "--model" and i + 1 < len(args):
            model_name = args[i + 1]
            i += 2
        elif args[i] == "--system" and i + 1 < len(args):
            system_prompt = args[i + 1]
            i += 2
        else:
            i += 1

    # Read input from stdin
    user_input = sys.stdin.read().strip()

    # Build messages
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_input})

    # Generate response
    response = client.chat.completions.create(
        model=model_name,
        messages=messages
    )

    print(response.choices[0].message.content)

if __name__ == "__main__":
    main()
GLM_EOF
    chmod +x /usr/local/bin/glm
    echo -e "${GREEN}GLM CLI wrapper olusturuldu.${NC}"
else
    echo -e "${GREEN}GLM CLI zaten yuklu.${NC}"
fi

echo -e "\n${BLUE}========================================"
echo "API KEY AYARLARI"
echo "========================================${NC}"
echo ""
echo "Asagidaki API key'leri ~/.zshrc veya ~/.bashrc dosyaniza ekleyin:"
echo ""
echo -e "${YELLOW}# AI Pipeline API Keys"
echo 'export ANTHROPIC_API_KEY="sk-ant-..."'
echo 'export OPENAI_API_KEY="sk-..."'
echo 'export GOOGLE_AI_API_KEY="AIza..."'
echo 'export ZHIPU_API_KEY="..."'
echo -e "${NC}"
echo ""
echo "Veya .env dosyasi olusturun:"
echo ""
echo -e "${CYAN}cat > .env << EOF"
echo 'ANTHROPIC_API_KEY=sk-ant-...'
echo 'OPENAI_API_KEY=sk-...'
echo 'GOOGLE_AI_API_KEY=AIza...'
echo 'ZHIPU_API_KEY=...'
echo "EOF${NC}"
echo ""

echo -e "${GREEN}========================================"
echo "KURULUM TAMAMLANDI!"
echo "========================================${NC}"
echo ""
echo "Kullanim:"
echo -e "${CYAN}./scripts/ai-pipeline.sh my-project \"Proje aciklamasi\"${NC}"
echo ""
