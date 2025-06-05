import React, { FunctionComponent } from 'react';
import Grid from 'antd/lib/grid';
import { Breakpoint } from 'antd/lib/_util/responsiveObserve';


const { useBreakpoint } = Grid;

export type TMediaQueryResult = Partial<Record<Breakpoint, boolean>> & {
    isPhone: boolean,
    isTablet: boolean,
    isDesktop: boolean
}

export const useMediaQueries = (): TMediaQueryResult => {
    const screen = useBreakpoint();
    /*let isPhone = false,
        isTablet = false,
        isDesktop = false,
        currentWidth = 0;

    const [ revision, setRevision ] = useState(0);
    //const NOOP = () => {};

    const computeVars = (ow: number, forceUpdate: boolean) => {
        currentWidth = ow;

        if (ow < 768 && !isPhone) {
            isPhone = true;
            isTablet = false;
            isDesktop = false;
            return forceUpdate && setRevision(revision + 1);
        }

        if (ow >= 768 && ow < 1200 && !isTablet) {
            isPhone = false;
            isTablet = true;
            isDesktop = false;
            return forceUpdate && setRevision(revision + 1);
        }

        if (ow >= 1200 && !isDesktop) {
            isPhone = false;
            isTablet = false;
            isDesktop = true;
            return forceUpdate && setRevision(revision + 1);
        }
    }
    // initial computation to setup vars on startup
    computeVars(window && window.outerWidth, false);

    useEffect(() => {
        let unmounted = false;

        const resizeHandler = (e: any)  => {
            if (!unmounted) computeVars(e.target.outerWidth, true);
        }

        window.addEventListener('resize', resizeHandler);
        
        return function cleanUp() {
            unmounted= true;
            window.removeEventListener('resize', resizeHandler);
        }
    });

    return {
        isPhone,
        isTablet,
        isDesktop,
        currentWidth
    }*/

    return {
        ...screen,
        isPhone: !!((screen.xs || screen.sm || screen.md) && !screen.lg),
        isTablet:  !!(screen.lg), //!!((screen.md || screen.lg) && !screen.xl),
        isDesktop: !!(screen.xl || screen.xxl)
    };
}

export type TMediaQueryProps = {
    showAtPhone?: boolean,
    showAtTablet?: boolean,
    showAtDesktop?: boolean
}

export const MediaQuery: FunctionComponent<TMediaQueryProps> = ( props ) => {
    const { showAtPhone, showAtTablet, showAtDesktop } = props;
    const { isPhone, isTablet, isDesktop } = useMediaQueries();

    if (showAtPhone && isPhone) return React.createElement(React.Fragment, { children: props.children });
    if (showAtTablet && isTablet) return React.createElement(React.Fragment,  { children: props.children });
    if (showAtDesktop && isDesktop) return React.createElement(React.Fragment,  { children: props.children });
    
    return null;
}

