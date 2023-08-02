import { Dispatch, createContext, useContext } from "react"
export const RouteContext = createContext<number|string>("")
export const SetRouteContext = createContext<Dispatch<React.SetStateAction<number|string>>>(()=>{})
export const useNavigator = ()=>useContext(SetRouteContext)
export const useRoute = ()=>useContext(RouteContext)