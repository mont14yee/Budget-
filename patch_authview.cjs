const fs = require('fs');
let code = fs.readFileSync('views/AuthView.tsx', 'utf8');

const oldHeader = `<div className={\`min-h-screen flex flex-col items-center justify-center p-6 \${theme === 'dark' ? 'dark bg-[#0b0f19] text-white' : 'bg-[#fcfdfd] text-gray-900'}\`}>
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50">`;

const newHeader = `<div className={\`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 \${theme === 'dark' ? 'dark bg-[#0b0f19] text-white' : 'bg-[#fcfdfd] text-gray-900'}\`}>
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {theme === 'light' ? (
                    <>
                        <div className="absolute top-[10%] left-[10%] w-[50%] h-[40%] rounded-full bg-[#7dd3fc]/40 blur-[100px]" />
                        <div className="absolute bottom-[20%] right-[10%] w-[60%] h-[50%] rounded-full bg-[#d8b4fe]/30 blur-[120px]" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-[10%] left-[10%] w-[50%] h-[40%] rounded-full bg-[#0284c7]/20 blur-[120px]" />
                        <div className="absolute bottom-[20%] right-[10%] w-[60%] h-[50%] rounded-full bg-[#a21caf]/15 blur-[120px]" />
                    </>
                )}
            </div>
            <div className="w-full max-w-md relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.3)] border border-white/60 dark:border-gray-700/50">`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('views/AuthView.tsx', code);
