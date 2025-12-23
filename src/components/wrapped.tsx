import { useState } from "react";

const UseWrapped = () => {
    const [isWrapped, setIsWrapped] = useState(true);

    const handleLayout = (event:any, length?:number) => {
        const { width } = event.nativeEvent.layout;

        if (width < (length || 300) ) {
            setIsWrapped(true);
        } else {
            setIsWrapped(false);
        }
    };
    return{
        isWrapped,
        handleLayout
    }
}

export default UseWrapped