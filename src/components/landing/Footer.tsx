

export const Footer = () => {
    return (
        <footer className="bg-[#050505] border-t border-zinc-900 py-20 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="max-w-sm">
                    <div className="flex items-center space-x-2 mb-6">
                        <img src="/favicon.svg" alt="Logo" className="w-8 h-8 filter brightness-100" />
                        <span className="text-lg font-bold tracking-tight text-white">Shadow Board</span>
                    </div>
                    <p className="text-zinc-500 leading-relaxed text-sm">
                        The world's first autonomous executive simulation engine.
                        Testing the future, today.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div>
                        <h4 className="text-white font-medium mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><a href="#" className="hover:text-[#6EE7B7] transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-[#6EE7B7] transition-colors">Security</a></li>
                            <li><a href="#" className="hover:text-[#6EE7B7] transition-colors">Enterprise</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><a href="#" className="hover:text-[#6EE7B7] transition-colors">Manifesto</a></li>
                            <li><a href="#" className="hover:text-[#6EE7B7] transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-[#6EE7B7] transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><a href="#" className="hover:text-[#6EE7B7] transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-[#6EE7B7] transition-colors">Terms</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-600">
                <p>© 2025 Shadow Board Intelligence Inc. All rights reserved.</p>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    System Normal
                </div>
            </div>
        </footer>
    );
};
