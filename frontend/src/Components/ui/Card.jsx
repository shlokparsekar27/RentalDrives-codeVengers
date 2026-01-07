const Card = ({ children, className = '', noPadding = false, hover = false, ...props }) => {
    return (
        <div
            className={`
                bg-card text-card-foreground 
                rounded-xl border border-border 
                shadow-sm 
                overflow-hidden
                ${hover ? 'transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:translate-y-[-2px] cursor-pointer' : ''}
                ${className}
            `}
            {...props}
        >
            <div className={noPadding ? '' : 'p-4 sm:p-6'}>
                {children}
            </div>
        </div>
    );
};

export default Card;
