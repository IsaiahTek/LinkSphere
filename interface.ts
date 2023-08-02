import { ReactElement } from "react";

interface NavigationProps{
    routes:{key:string, title:string, element:ReactElement, focusedIcon:string, unFocusedIcon:string}[]
}

export default NavigationProps