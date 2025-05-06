import React from 'react';

//frontend/components/footer.tsx
const Footer: React.FC = () => {
    return (
        <footer className="text-center p-2 italic bg-black/90 text-sm text-white bottom-0 w-full">
            <p>&copy; {new Date().getFullYear()} SignSerenade:Your Voice in Signs | Developed by Cows🐮🐄</p>
        </footer>
    );
};

export default Footer;