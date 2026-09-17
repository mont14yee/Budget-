const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const loader = `
<div className={\`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 \${theme === 'dark' ? 'dark bg-[#0b0f19] text-white' : 'bg-[#fcfdfd] text-gray-900'}\`}>
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {theme === 'light' ? (
            <>
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[#7dd3fc]/40 blur-[100px]" />
            </>
        ) : (
            <>
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[#0284c7]/20 blur-[120px]" />
            </>
        )}
    </div>
    <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse tracking-wide uppercase text-xs">Loading Secure Environment</p>
    </div>
</div>
`;

code = code.replace(/<div className="min-h-screen flex items-center justify-center font-light text-gray-500">Loading\.\.\.<\/div>/g, loader);
code = code.replace(/<div className="min-h-screen flex items-center justify-center font-light text-gray-500">Loading user data\.\.\.<\/div>/g, loader.replace('Loading Secure Environment', 'Decrypting Financial Data'));
code = code.replace(/<div className="min-h-screen flex items-center justify-center font-light text-gray-500">Loading profile\.\.\.<\/div>/g, loader.replace('Loading Secure Environment', 'Preparing Profile'));

fs.writeFileSync('App.tsx', code);
