type P = { className?: string };
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const FlameIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M12 3c.5 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 .8-3.2 2-4 0 2 .8 3 2 3 0-3-1.2-5.5 1-9z" /></svg>);
export const HeartIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>);
export const ChatIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M4 5h16v11H9l-5 4z" /></svg>);
export const UserIcon = ({ className }: P) => (<svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>);
export const BackIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M15 5l-7 7 7 7" /></svg>);
export const SendIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M4 12l16-8-6 16-3-7z" /></svg>);
export const CopyIcon = ({ className }: P) => (<svg {...base} className={className}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>);
export const XIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const MergeIcon = ({ className }: P) => (<svg {...base} className={className}><circle cx="6" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="12" r="2" /><path d="M6 7v10M8 6c6 0 10 2 10 4" /></svg>);
