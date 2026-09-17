const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');
code = code.replace(
    "const [theme, setTheme] = useState<'light' | 'dark'>(() => {\n        const savedTheme = localStorage.getItem('theme');\n        return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'dark';\n    });",
    "const [theme, setTheme] = useState<'light' | 'dark'>(() => {\n        const savedTheme = localStorage.getItem('theme');\n        return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'dark';\n    });\n\n    useEffect(() => {\n        localStorage.setItem('theme', theme);\n        document.documentElement.classList.toggle('dark', theme === 'dark');\n    }, [theme]);"
);
fs.writeFileSync('App.tsx', code);
