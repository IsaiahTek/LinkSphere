import React, { FC, useEffect } from "react"
import { useState } from "react"
// import { Text } from "react-native-paper"
import { SettingsPage, DM_LinkCreator, EmailLinkCreator } from "./App"
import { View , Text, Button, Pressable, StatusBar} from "react-native"
import NavigationProps from "./interface"
import { IconButton } from "react-native-paper"
import { RouteContext, SetRouteContext } from "./RouteContext"

export const SMS = ()=><View style={{paddingHorizontal:15, backgroundColor:"white", height:"85%", justifyContent:"center", display:"flex", alignItems:"center"}}>
    <Text style={{fontSize:24}}>This is coming soon</Text>
</View>
export const BottomNavigation:FC<NavigationProps> = ({routes})=>{

    const [index, setIndex] = useState<number|string>("Endpoint")
    
    return(
        <RouteContext.Provider value={index}>
            <SetRouteContext.Provider value={setIndex}>
                <View style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
                {routes.map((r,id)=>
                    <View key={r.key} style={{alignItems:"center", width:`${(100/routes.length)}%`, justifyContent:"center", paddingTop:10, backgroundColor:id===index || r.key === index?"white":"transparent", borderTopStartRadius:5, borderTopRightRadius:5}}>
                        <Pressable onPress={()=>setIndex(typeof index ==="string"?r.key:id)}>
                            {id===index || r.key===index?<Text style={{textAlign:"center", fontWeight:"500", color:"indigo"}}>{r.title}</Text>:null}
                            <IconButton style={{alignSelf:"center"}} mode="contained" icon={r.focusedIcon} />
                        </Pressable>
                    </View>
                )}
                </View>
                {typeof index === "string"?routes.find(r=>r.key===index)?.element:routes[index].element}
            </SetRouteContext.Provider>
        </RouteContext.Provider>
    )
}

export const BottomNav = ()=>{
    
    const routes = [
        {key:"Endpoint", title:"Endpoints", element:<SettingsPage />, focusedIcon:"map-marker", unFocusedIcon:"mail"},
        {key:"Social", title:"Social Links", element:<DM_LinkCreator />, focusedIcon:"chat", unFocusedIcon:"email"},
        {key:"Email", title:"Email Links", element:<EmailLinkCreator />, focusedIcon:"mail", unFocusedIcon:"mail"},
        {key:"SMS", title:"SMS", element:<SMS />, focusedIcon:"email", unFocusedIcon:"email"},
    ]

    return(
        <BottomNavigation routes={routes} />
    )
}

export const useBottomNavigator = (initialState:any)=>{
    const [route, setRoute] = useState(initialState)
    return [route, setRoute]
}

// function useComplexState(initialState) {
//     const [state, setState] = useState(initialState);
//     function setProperty(key, value) {
//         setState((prevState) => ({ ...prevState, [key]: value }));
//     }
//     return [state, setProperty];
// }