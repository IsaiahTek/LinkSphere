import { FC, useEffect, useState } from "react"
import { ScrollView } from "react-native"
import { Drawer } from "react-native-paper"
import { useNavigator, useRoute } from "./RouteContext"
export const AppDrawer:FC<any> = ({navigation})=>{
    const route = useRoute()
    const setActive = useNavigator()
    const handleSetActive = (label:string)=>{
        if(navigation){
            navigation.navigate(label)
            setActive(label)
        }
    }
    useEffect(()=>{
        setActive(route.toString())
    },[route])
    return(
        <ScrollView>
            <Drawer.Section theme={navigation.theme} title="Links">
                <Drawer.Item label="Home" active={route==="Home"} icon="home" onPress={()=>handleSetActive("Home")} />
                <Drawer.Item label="Socials" icon="link" onPress={()=>handleSetActive("Socials")} active={route==="Socials"} />
                <Drawer.Item label="Email" icon="email" onPress={()=>handleSetActive("Email")} active={route==="Email"} />
                <Drawer.Item label="SMS" icon="inbox" onPress={()=>handleSetActive("SMS")} active={route==="SMS"} />
            </Drawer.Section>
            <Drawer.Section title="Activities">
                <Drawer.Item label="Watch" icon="video" onPress={()=>handleSetActive("Email")} active={route==="Email"} />
                <Drawer.Item label="Engage" icon="youtube" onPress={()=>handleSetActive("SMS")} active={route==="SMS"} />
            </Drawer.Section>
        </ScrollView>
    )
}