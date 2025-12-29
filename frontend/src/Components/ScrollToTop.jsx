import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Instant, no smooth scroll, for precise "new page" feel
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
