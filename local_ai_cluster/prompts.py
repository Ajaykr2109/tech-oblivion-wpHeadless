#!/usr/bin/env python3
"""
Prompt Manager - Handles AI prompts for different languages and tasks
"""

import json
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path
import re


class PromptManager:
    """Manages prompts for different programming languages and tasks"""
    
    def __init__(self, config_path: str = "config.json"):
        self.logger = logging.getLogger(__name__)
        self.prompts = self._load_default_prompts()
        self.runtime_toggles = {
            "replace_any": False,
            "remove_unused_imports": True,
            "enforce_typing": True,
            "add_todos": False,
            "preserve_comments": True,
            "add_docstrings": False,
            "optimize_performance": False
        }
    
    def _load_default_prompts(self) -> Dict[str, Dict[str, str]]:
        """Load default prompts for supported languages"""
        return {
            "typescript": {
                "refactor": """You are an expert TypeScript developer. Refactor the following code while maintaining its functionality:

REQUIREMENTS:
- Fix any TypeScript errors
- Improve type safety
- Remove unused imports
- Follow best practices
- Maintain backward compatibility
- Preserve existing functionality

{toggles_text}

CODE TO REFACTOR:
```typescript
{code}
```

Return ONLY the refactored code without explanations or markdown formatting.""",
                
                "lint": """Fix linting issues in this TypeScript code:

{code}

Fix these specific issues:
- ESLint errors
- TypeScript compiler errors
- Unused variables/imports
- Type annotations
- Code style issues

Return only the fixed code.""",
                
                "codegen": """Generate TypeScript code for the following requirement:

REQUIREMENT: {description}

GUIDELINES:
- Use proper TypeScript types
- Include error handling
- Follow modern ES6+ patterns
- Add appropriate comments
- Make it production-ready

Return only the code without explanations."""
            },
            
            "python": {
                "refactor": """You are an expert Python developer. Refactor the following code while maintaining its functionality:

REQUIREMENTS:
- Fix any syntax/logic errors
- Improve code structure and readability
- Add type hints where appropriate
- Remove unused imports
- Follow PEP 8 guidelines
- Maintain existing functionality

{toggles_text}

CODE TO REFACTOR:
```python
{code}
```

Return ONLY the refactored code without explanations or markdown formatting.""",
                
                "lint": """Fix linting issues in this Python code:

{code}

Fix these specific issues:
- Syntax errors
- Import errors
- Undefined variables
- Type hint issues
- PEP 8 violations
- Logic errors

Return only the fixed code.""",
                
                "codegen": """Generate Python code for the following requirement:

REQUIREMENT: {description}

GUIDELINES:
- Use type hints
- Include proper error handling
- Follow PEP 8 standards
- Add docstrings
- Make it robust and maintainable

Return only the code without explanations."""
            },
            
            "php": {
                "refactor": """You are an expert PHP developer. Refactor the following code while maintaining its functionality:

REQUIREMENTS:
- Fix any PHP syntax errors
- Improve code structure
- Add proper type declarations
- Remove unused code
- Follow PSR-12 standards
- Maintain existing functionality

{toggles_text}

CODE TO REFACTOR:
```php
{code}
```

Return ONLY the refactored code without explanations or markdown formatting.""",
                
                "lint": """Fix linting issues in this PHP code:

{code}

Fix these specific issues:
- Syntax errors
- Undefined variables
- Type declaration issues
- PSR standards violations
- Logic errors

Return only the fixed code.""",
                
                "codegen": """Generate PHP code for the following requirement:

REQUIREMENT: {description}

GUIDELINES:
- Use proper type declarations
- Include error handling
- Follow PSR-12 standards
- Add PHPDoc comments
- Make it secure and efficient

Return only the code without explanations."""
            },
            
            "general": {
                "chat": """You are a helpful AI assistant specialized in software development. 
Answer the user's question accurately and provide practical solutions.

{context}

USER QUESTION: {query}""",
                
                "doc_query": """You are analyzing a codebase. Answer the following question based on the provided context:

CONTEXT:
{context}

QUESTION: {query}

Provide a clear, accurate answer with relevant code examples if applicable.""",
                
                "explain": """Explain the following code in simple terms:

{code}

Include:
- What the code does
- Key components and their purpose
- Any potential issues or improvements
- How it fits into the larger system"""
            }
        }
    
    def get_refactor_prompt(self, language: str, refactor_type: str, code: str) -> str:
        """Get a refactor prompt for a specific language"""
        language = language.lower()
        
        # Get base prompt
        if language in self.prompts:
            prompt_template = self.prompts[language].get("refactor", "")
        else:
            # Auto-generate prompt for unknown language
            prompt_template = self._generate_language_prompt(language, "refactor")
        
        # Build toggles text
        toggles_text = self._build_toggles_text()
        
        # Format prompt
        return prompt_template.format(
            code=code,
            refactor_type=refactor_type,
            toggles_text=toggles_text
        )
    
    def get_lint_prompt(self, language: str, code: str) -> str:
        """Get a lint/fix prompt for a specific language"""
        language = language.lower()
        
        if language in self.prompts:
            prompt_template = self.prompts[language].get("lint", "")
        else:
            prompt_template = self._generate_language_prompt(language, "lint")
        
        return prompt_template.format(code=code)
    
    def get_codegen_prompt(self, language: str, description: str) -> str:
        """Get a code generation prompt for a specific language"""
        language = language.lower()
        
        if language in self.prompts:
            prompt_template = self.prompts[language].get("codegen", "")
        else:
            prompt_template = self._generate_language_prompt(language, "codegen")
        
        return prompt_template.format(description=description)
    
    def get_chat_prompt(self, query: str, context: str = "") -> str:
        """Get a chat prompt"""
        prompt_template = self.prompts["general"]["chat"]
        return prompt_template.format(query=query, context=context)
    
    def get_doc_query_prompt(self, query: str, context: str) -> str:
        """Get a documentation query prompt"""
        prompt_template = self.prompts["general"]["doc_query"]
        return prompt_template.format(query=query, context=context)
    
    def get_explain_prompt(self, code: str) -> str:
        """Get a code explanation prompt"""
        prompt_template = self.prompts["general"]["explain"]
        return prompt_template.format(code=code)
    
    def _build_toggles_text(self) -> str:
        """Build text describing current runtime toggles"""
        enabled_toggles = [name for name, enabled in self.runtime_toggles.items() if enabled]
        
        if not enabled_toggles:
            return ""
        
        toggle_descriptions = {
            "replace_any": "Replace 'any' types with proper types",
            "remove_unused_imports": "Remove unused imports and variables",
            "enforce_typing": "Add type annotations where missing",
            "add_todos": "Add TODO comments for potential improvements",
            "preserve_comments": "Keep existing comments",
            "add_docstrings": "Add docstrings/documentation",
            "optimize_performance": "Optimize for better performance"
        }
        
        toggles_text = "ADDITIONAL REQUIREMENTS:\n"
        for toggle in enabled_toggles:
            description = toggle_descriptions.get(toggle, toggle.replace('_', ' ').title())
            toggles_text += f"- {description}\n"
        
        return toggles_text
    
    def _generate_language_prompt(self, language: str, task_type: str) -> str:
        """Auto-generate a prompt for an unknown language"""
        self.logger.info(f"Auto-generating {task_type} prompt for language: {language}")
        
        if task_type == "refactor":
            return f"""You are an expert {language} developer. Refactor the following code while maintaining its functionality:

REQUIREMENTS:
- Fix any syntax or logic errors
- Improve code structure and readability
- Follow {language} best practices and conventions
- Remove unused code
- Maintain existing functionality

{{toggles_text}}

CODE TO REFACTOR:
```{language}
{{code}}
```

Return ONLY the refactored code without explanations or markdown formatting."""

        elif task_type == "lint":
            return f"""Fix linting and syntax issues in this {language} code:

{{code}}

Fix these specific issues:
- Syntax errors
- Style violations
- Undefined variables
- Logic errors
- Best practice violations

Return only the fixed code."""

        elif task_type == "codegen":
            return f"""Generate {language} code for the following requirement:

REQUIREMENT: {{description}}

GUIDELINES:
- Follow {language} best practices
- Include proper error handling
- Add appropriate comments
- Make it robust and maintainable

Return only the code without explanations."""
        
        return ""
    
    def set_toggle(self, toggle_name: str, enabled: bool):
        """Set a runtime toggle"""
        if toggle_name in self.runtime_toggles:
            self.runtime_toggles[toggle_name] = enabled
            self.logger.info(f"Set toggle '{toggle_name}' to {enabled}")
        else:
            self.logger.warning(f"Unknown toggle: {toggle_name}")
    
    def get_toggle(self, toggle_name: str) -> bool:
        """Get the state of a runtime toggle"""
        return self.runtime_toggles.get(toggle_name, False)
    
    def get_all_toggles(self) -> Dict[str, bool]:
        """Get all runtime toggles"""
        return self.runtime_toggles.copy()
    
    def add_language_prompt(self, language: str, task_type: str, prompt: str):
        """Add a new prompt for a language/task combination"""
        if language not in self.prompts:
            self.prompts[language] = {}
        
        self.prompts[language][task_type] = prompt
        self.logger.info(f"Added {task_type} prompt for {language}")
    
    def auto_detect_language(self, code: str, file_extension: str = "") -> str:
        """Auto-detect programming language from code or file extension"""
        # Extension-based detection
        extension_map = {
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".jsx": "javascript",
            ".php": "php",
            ".java": "java",
            ".cpp": "cpp",
            ".c": "c",
            ".cs": "csharp",
            ".rb": "ruby",
            ".go": "go",
            ".rs": "rust",
            ".swift": "swift",
            ".kt": "kotlin",
            ".scala": "scala",
            ".sh": "bash",
            ".ps1": "powershell"
        }
        
        if file_extension in extension_map:
            return extension_map[file_extension]
        
        # Content-based detection
        code_lower = code.lower()
        
        # Python indicators
        if any(keyword in code for keyword in ["def ", "import ", "from ", "class ", "if __name__"]):
            return "python"
        
        # JavaScript/TypeScript indicators
        if any(keyword in code for keyword in ["function", "const ", "let ", "var ", "=>"]):
            if "interface " in code or ": string" in code or ": number" in code:
                return "typescript"
            return "javascript"
        
        # PHP indicators
        if "<?php" in code or "$" in code and "function" in code:
            return "php"
        
        # Java indicators
        if "public class" in code or "public static void main" in code:
            return "java"
        
        # Default to general
        return "general"
    
    def validate_prompt(self, prompt: str) -> bool:
        """Validate that a prompt has required placeholders"""
        required_placeholders = ["{code}", "{description}", "{query}", "{context}"]
        
        # Check if prompt has at least one valid placeholder
        for placeholder in required_placeholders:
            if placeholder in prompt:
                return True
        
        return False
    
    def export_prompts(self, filename: str):
        """Export current prompts to file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump({
                    "prompts": self.prompts,
                    "runtime_toggles": self.runtime_toggles
                }, f, indent=2)
            self.logger.info(f"Prompts exported to {filename}")
        except Exception as e:
            self.logger.error(f"Failed to export prompts: {e}")
    
    def import_prompts(self, filename: str):
        """Import prompts from file"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if "prompts" in data:
                self.prompts.update(data["prompts"])
            
            if "runtime_toggles" in data:
                self.runtime_toggles.update(data["runtime_toggles"])
            
            self.logger.info(f"Prompts imported from {filename}")
        except Exception as e:
            self.logger.error(f"Failed to import prompts: {e}")
    
    def get_language_capabilities(self, language: str) -> List[str]:
        """Get available capabilities for a language"""
        language = language.lower()
        if language in self.prompts:
            return list(self.prompts[language].keys())
        return []
    
    def get_supported_languages(self) -> List[str]:
        """Get list of supported languages"""
        return [lang for lang in self.prompts.keys() if lang != "general"]


if __name__ == "__main__":
    # Test the prompt manager
    pm = PromptManager()
    
    # Test language detection
    python_code = """
def hello_world():
    print("Hello, World!")
    
if __name__ == "__main__":
    hello_world()
"""
    
    detected = pm.auto_detect_language(python_code)
    print(f"Detected language: {detected}")
    
    # Test prompt generation
    prompt = pm.get_refactor_prompt("python", "general", python_code)
    print(f"Generated prompt:\n{prompt}")
    
    # Test toggles
    pm.set_toggle("add_todos", True)
    pm.set_toggle("enforce_typing", True)
    
    prompt_with_toggles = pm.get_refactor_prompt("python", "general", python_code)
    print(f"Prompt with toggles:\n{prompt_with_toggles}")
