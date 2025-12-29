const Card = ({ children, className = '', noPadding = false, hover = false }) => {
    return (
        <div
            className={`
                bg-card text-card-foreground 
                rounded-xl border border-border 
                shadow-sm 
                ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer' : ''}
                ${className}
            `}
        >
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
};

export default Card;
