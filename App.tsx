import React, {useState, useEffect, ReactElement, FC} from 'react';
import { StatusBar, ToastAndroid, View, ScrollView, useColorScheme, Alert, Linking, Pressable, Modal } from 'react-native';
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";
import Clipboard from '@react-native-clipboard/clipboard';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {useTheme, MD3LightTheme as DefaultTheme, Provider as PaperProvider, Text, Button, TextInput, Divider, IconButton, Menu, FAB} from "react-native-paper"
import { SMS } from './BottomNav';
import { NavigationAction, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { generateRandomKey } from './string';

import {  BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import MenuItem from 'react-native-paper/lib/typescript/src/components/Menu/MenuItem';
import { RouteContext, SetRouteContext, useNavigator } from './RouteContext';
import { AppDrawer } from './AppDrawer';

export const lightGreen50 = '#f1f8e9';
export const lightGreen100 = '#dcedc8';

const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-4080611919888715/5903647229';

// const appOpenAd = BannerAd.createForAdRequest(adUnitId, {
//   requestNonPersonalizedAdsOnly: true
// });

// Preload an app open ad
// appOpenAd.load();

// // Show the app open ad when user brings the app to the foreground.
// appOpenAd.show();


const Stack = createNativeStackNavigator()
const Drawer = createDrawerNavigator()

const MKKV = new MMKVLoader().initialize()
type endpoint = {
    whatsappNumber:string,
    twitterID:string,
    instagramUsername:string,
    facebookPageName:string,
    index:string,
    label:string
}
export const theme = {
    ...DefaultTheme,
    roundness: 8,
    colors: {
      ...DefaultTheme.colors,
      primary: 'green',
      primaryContainer:lightGreen100,
      secondaryContainer:lightGreen50,
      backgroundColor:"white",
    },
};

const styles = {
    common:{marginVertical:20},
    // linkHeader:{flexDirection:"row", justifyContent:"space-between", alignItems:"center"},
    linkTextBox:{paddingHorizontal:15, paddingVertical:25, color:"gray", elevation:.5, backgroundColor:"#F0F0F011"},
    button:{padding:20, paddingVertical:15, borderRadius:99, elevation:10},
    buttonText:{textAlign:"center", color:"white", fontWeight:"600"}
}

const App = () => {
    const [route, setRoute] = useState<string|number>("Home")
    return (
        <PaperProvider theme={theme}>
            <StatusBar backgroundColor={theme.colors.primary} />
            <RouteContext.Provider value={route}>
                <SetRouteContext.Provider value={setRoute}>
                    <NavigationContainer>
                        <Drawer.Navigator screenOptions={{headerTintColor:theme.colors.primary, drawerActiveBackgroundColor:theme.colors.primary}} drawerContent={(props)=><AppDrawer {...props} />} >
                            <Drawer.Screen name='Home' component={SettingsPage}  />
                            <Drawer.Screen name="Socials" component={DM_LinkCreator} />
                            <Drawer.Screen name="Email" component={EmailLinkCreator} />
                            <Drawer.Screen name="SMS" component={SMS} />
                        </Drawer.Navigator>
                    </NavigationContainer>
                </SetRouteContext.Provider>
            </RouteContext.Provider>
            {/* </SafeAreaView> */}
        </PaperProvider>
    );
};

export default App;

const InputView:FC<{title:string, value:string, keyboardType:"phone-pad"|"email-address"|"default", setAction:Function, icon?:string, multiline?:boolean, numberOfLines?:number, placeholder:string}> = ({title, value, setAction, placeholder, numberOfLines, keyboardType, multiline, icon})=>{
    const iconLeft = icon?<TextInput.Icon icon={icon} />:null
    return(
        <View style={[styles.common]}>
            <TextInput theme={{roundness:35}} mode='flat' label={title} multiline={multiline} numberOfLines={numberOfLines} style={{backgroundColor:"transparent"}} value={value} keyboardType={keyboardType} placeholder={placeholder} onChangeText={(val)=>setAction(val)} left={iconLeft} />
        </View>
    )
}

// const Colors = {
//     dark:{
//         backgroundColor:"#270000",
//         inputBackground:"#FF000044",
//         inputColor:"#CCCCCC",
//         bgText:"#AAAAAA",
//         brandText:"orange"
//     },
//     light:{
//         backgroundColor:"white",
//         inputBackground:"white",
//         inputColor:"#111111",
//         bgText:"#333333",
//         brandText:"brown"
//     }
// }
// export const AppTools = ({navigation, route})=>{
//     const {colors} = useTheme()
//     return(
//         <View style={[{flex:1, justifyContent:"center", alignItems:"center", backgroundColor:theme.colors.backgroundColor}]}>
//             <View style={[{marginHorizontal:20, maxWidth:400}, styles.common]}>
//                 <Text variant="displayMedium" style={{color:colors.primary, fontWeight:"bold", textAlign:"center"}}>
//                     SocioMarketer
//                 </Text>
//                 <Text style={{fontSize:12, fontStyle:"italic", textAlign:"center", color:colors.secondary, marginBottom:20}}>Be in control of your digital marketing with zero experience</Text>
//                 <Text style={{fontSize:20, textAlign:"center"}}>Make your customers send you a direct message across all of your favourite social media platforms and more</Text>
//             </View>
//             <Button style={[styles.common, styles.button]} onPress={()=>navigation.navigate("profile")}>
//                 <Text style={[{fontSize:16, color:"red"}]}>My Profile</Text>
//             </Button>
//             <Button mode="contained" onPress={()=>navigation.navigate("message-link-creator")}>
//                 <Text style={[{fontSize:16}]}>DM Link Creator</Text>
//             </Button>

//             <Button style={[styles.common, styles.button]} onPress={()=>navigation.navigate("email-link-creator")}>
//                 <Text style={[{fontSize:16, color:"#DD0000"}]}>Email Link Creator</Text>
//             </Button>

//         </View>
//     )
// }

type socialLinkType = {message:string, encodedMessage:string, endpointIndex:string}

const emptyMessage = {message:"", encodedMessage:"", endpointIndex:""}

const emptyEndpoint = {whatsappNumber:"", twitterID:"", instagramUsername:"", facebookPageName:"", index:"", label:""}

export const DM_LinkCreator:FC<any> = ({navigation})=>{
    const [socialLink, setSocialLink] = useState<socialLinkType>()
    const [socialLinks, setSocialLinks] = useMMKVStorage<socialLinkType[]>("socialLinks", MKKV, [emptyMessage])

    const [currentLinkIndex, setCurrentLinkIndex] = useState(0)
    
    const getTwitterDMLink = (twitterID:string, encodedMessage:string) => `https://twitter.com/messages/compose?recipient_id=${encodeURIComponent(twitterID)}&text=${encodedMessage}`
    
    const getFormattedWA_Number = (whatsappNumber:string)=> whatsappNumber.toString().startsWith("0")?"234"+whatsappNumber.substring(1):whatsappNumber
    const getWhatsappDMLink = (whatsappNumber:string, encodedMessage:string)=> `https://wa.me/${encodeURIComponent(getFormattedWA_Number(whatsappNumber))}?text=${encodedMessage}`

    const getInstagramDMLink = (instagramUsername:string)=> `https://ig.me/m/${encodeURIComponent(instagramUsername)}`

    const getFacebookDMLink = (facebookPageName:string)=> `http://m.me/${encodeURIComponent(facebookPageName)}`

    const setClipboardTextAndNotify = (link:string, notification:string, paramForCheckingAvailability: string | any[]) => {
        if(paramForCheckingAvailability.length){
            Clipboard.setString(link)
            ToastAndroid.show(notification, ToastAndroid.SHORT)
        }else{
            Alert.alert(
                "Missing Parameter",
                "You need to set the value to be used for this feature in Profile",
                [
                    {text:"Set"},
                    {text:""},
                    {text:"Cancel"}
                ]
            )
        }
    }

    const openLink = async(url:string, linkCoreParam: string | any[])=>{
        const isSupportedLink = await Linking.canOpenURL(url)
        if(isSupportedLink){
            if(linkCoreParam.length){
                Linking.openURL(url)
            }else{
                Alert.alert(
                    "Missing Parameter",
                    "You need to set the value to be used for this feature in Profile",
                    [
                        {text:"Set",},
                        {text:""},
                        {text:"Cancel", style:"cancel"}
                    ]
                )
            }
        }else{
            Alert.alert(
                "Link Error",
                "please enter safe and appropriate characters",
                [
                    {text:"OK",},
                    {text:""},
                    {text:"Cancel"}
                ]
                )
            }
    }
    
    const setMessageAndEncodedMessage = (message:string)=>{
        setSocialLinks(socialLinks.map((s,id)=>{
            if(id!=currentLinkIndex){
                return s
            }else{
                s.message = message
                s.encodedMessage = encodeURIComponent(message)
                return s
            }
        }))
    }

    const DM_Link:FC<{link:string, linkCoreParam:string, children?:ReactElement}> = ({link, linkCoreParam, children})=>(
        <View style={{display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
            <View style={[styles.linkTextBox, {width:"80%"}]}>
                <Pressable onPress={()=>openLink(link, linkCoreParam)}>
                    <Text style={{color:"gray"}}>{message}</Text>
                </Pressable>
            </View>
            <View style={{backgroundColor:linkCoreParam?theme.colors.primary:"#a47dc1", height:"100%", width:"20%", alignItems:"center", justifyContent:"center", display:"flex", flexDirection:"row"}}>
                {children}
            </View>
        </View>
    )
    const dayNightMode = useColorScheme();

    const [isCreating, setIsCreating] = useState(true)
    const [endpointIndex, setEndpointIndex] = useState("")
    const {message, encodedMessage} = socialLinks[currentLinkIndex]?socialLinks[currentLinkIndex]:emptyMessage

    const [endpoints] = useMMKVStorage<endpoint[]>("endpoints", MKKV, [])

    const [selectedEndpoint, setSelectedEndpoint] = useState<endpoint>(endpoints[0])
    const [openEndpointSelect, setOpenEndpointSelect] = useState(false)
    const {whatsappNumber, twitterID, instagramUsername, facebookPageName} = selectedEndpoint?selectedEndpoint:emptyEndpoint
    const setIndex = useNavigator()
    return(
        <View style={{flex:1, backgroundColor:theme.colors.backgroundColor}}>
            <View style={{paddingHorizontal:20, paddingVertical:20, borderBottomColor:"indigo", borderBottomWidth:1}}>
                <Text>Enter a message and pick an endpoint to create a new link</Text>
                <TextInput
                    label="Enter message here"
                    theme={{roundness:0}}
                    multiline={true} 
                    numberOfLines={3}
                    value={message}
                    style={[{marginVertical:10, backgroundColor:"transparent"}]} 
                    onChangeText={newVal=> setMessageAndEncodedMessage(newVal)} />
                <View style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
                    <View style={{marginRight:20}}>
                        <Text>{selectedEndpoint?"Select ":"No "} Endpoint:</Text>
                    </View>
                    {selectedEndpoint?
                    <Menu
                        visible={openEndpointSelect}
                        onDismiss={()=>setOpenEndpointSelect(false)}
                        anchor={
                            <Pressable android_ripple={{color:"#e7c6ff"}} style={{paddingHorizontal:20}} onPress={()=>setOpenEndpointSelect(true)}>
                                <View style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
                                    <Text style={{color:theme.colors.primary}}>{selectedEndpoint.label?selectedEndpoint.label:selectedEndpoint.index}</Text>
                                    <IconButton iconColor={theme.colors.primary} icon="chevron-down" />
                                </View>
                            </Pressable>}>
                                {endpoints.map(ep=><Menu.Item key={ep.index} title={ep.label?ep.label:ep.index} onPress={()=>{setSelectedEndpoint(ep);setOpenEndpointSelect(false)}} />)}
                    </Menu>
                    :
                    <Button onPress={()=>{navigation.navigate("Home"); setIndex("Home")}}>Create Endpoint</Button>
                    }
                </View>
            </View>
            <Divider />
            {isCreating?
            <ScrollView>
                {selectedEndpoint?
                <View style={{paddingHorizontal:20, paddingVertical:20}}>
                    <View style={{marginTop:25}}>
                        <Text>Existing</Text>
                    </View>
                    <View style={styles.common}>
                        <View>
                            <Text>WhatsApp Link</Text>
                            <DM_Link link={getWhatsappDMLink(whatsappNumber, encodedMessage)} linkCoreParam={whatsappNumber}>
                                <Pressable style={{padding:15}} onPress={()=>{setClipboardTextAndNotify(getWhatsappDMLink(whatsappNumber, encodedMessage), "WhatsApp link copied!", whatsappNumber)}} >
                                    <Text style={{color:"white", textAlign:"center"}}>Copy Link</Text>
                                </Pressable>
                            </DM_Link>
                        </View>


                    </View>

                    <View style={styles.common}>
                        <View>
                            <Text>Twitter Link</Text>
                            <DM_Link link={getTwitterDMLink(twitterID, encodedMessage)} linkCoreParam={twitterID} >
                                <Pressable style={{padding:15}} onPress={()=>{setClipboardTextAndNotify(getTwitterDMLink(twitterID, encodedMessage), "Twitter link copied!", twitterID)}}>
                                    <Text style={{color:"white", textAlign:"center"}}>Copy Link</Text>
                                </Pressable>
                            </DM_Link>
                        </View>
                    </View>

                    <View style={styles.common}>
                        <View>
                            <Text>Instagram Link</Text>
                            <DM_Link link={getInstagramDMLink(instagramUsername)} linkCoreParam={instagramUsername} >
                                <Pressable style={{padding:15}} onPress={()=>{setClipboardTextAndNotify(getInstagramDMLink(instagramUsername), "Instagram link copied!", instagramUsername)}} >
                                    <Text style={{color:"white", textAlign:"center"}}>Copy Link</Text>
                                </Pressable>
                            </DM_Link>
                        </View>
                    </View>

                    <View style={styles.common}>
                        <View>
                            <Text>Facebook Link</Text>
                            <DM_Link link={getFacebookDMLink(facebookPageName)} linkCoreParam={facebookPageName} />
                            <View style={{position:"relative", top:-74, right:"-80%", width:80, padding:8}}>
                                <Pressable style={{padding:15}} onPress={()=>{setClipboardTextAndNotify(getFacebookDMLink(facebookPageName), "Facebook link copied!", facebookPageName)}}>
                                    <Text style={{ color:"white", textAlign:"center"}}>Copy Link</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
                :
                null
                }
            </ScrollView>
            :
            null
            }
        </View>
    )
}

export const EmailLinkCreator = ()=>{
    const [email, setEmail] = useMMKVStorage("email", MKKV, "")
    const [cc, setCc] = useMMKVStorage("cc", MKKV, "")
    const [bcc, setBcc] = useMMKVStorage("bcc", MKKV, "")
    const [subject, setSubject] = useMMKVStorage("subject", MKKV, "")
    const [emailBody, setEmailBody] = useMMKVStorage("emailBody", MKKV, "")

    // const [email, setEmail] = useState("")
    // const [cc, setCc] = useState("")
    // const [bcc, setBcc] = useState("")
    // const [subject, setSubject] = useState("")
    // const [emailBody, setEmailBody] = useState("")
    
    
    
    const {colors} = useTheme()

    const emailLink = `mailto:${email}?cc${cc}&bcc${bcc}&subject${subject}&body${emailBody}`

    const setClipboardTextAndNotify = ()=>{
        if(email.length){
            Clipboard.setString(encodeURI(emailLink))
            ToastAndroid.show("Email link copied!", ToastAndroid.SHORT)
        }else{
            Alert.alert("Enter your email address")
        }
    }
    return(
        <View style={{flex:1, backgroundColor:theme.colors.backgroundColor}}>
            <ScrollView>
                <View style={{paddingHorizontal:20, paddingVertical:20}}>
                    <InputView icon="email" title="Your email address" placeholder="e.g mailman@domain.com" keyboardType="email-address" value={email} setAction={setEmail} />
                    <InputView icon="alpha-c" title="CC [optional]" placeholder="second@dom.com" keyboardType="email-address" value={cc} setAction={setCc} />
                    <InputView icon="alpha-b" title="BCC [optional]" placeholder="third@dom.com" keyboardType="email-address" value={bcc} setAction={setBcc} />
                    <InputView icon="alpha-s" title="Subject [optional]" placeholder="Title of mail" keyboardType="default" value={subject} setAction={setSubject} />
                    <InputView multiline={true} numberOfLines={5} title="Message [optional]" placeholder="Enter your mail here" keyboardType="default" value={emailBody} setAction={setEmailBody} />
                    <View>
                        <Button mode="contained" onPress={()=>{setClipboardTextAndNotify()}}>
                            <Text style={[{color:"white"}]}>Copy Email Link</Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}
export const EditEndpoint:FC<{endpoint:endpoint, endpoints:endpoint[], setEndpoints:Function, doneAction:Function}> = ({endpoint, endpoints, setEndpoints, doneAction})=>{

    
    const [editingEndpoint, setEditingEndpoint] = useState<endpoint>(endpoint)
    
    const {whatsappNumber, twitterID, instagramUsername, facebookPageName, label, index} = editingEndpoint

    const handleSetEnpointAttr = (attr: string, val:string)=>{
        setEndpoints(endpoints.map((ep,id)=>(ep.index === index)?{...ep, [attr]:val}:ep))
    }

    const handleSetEditingAttr = (attr:string, val:string)=>{
        setEditingEndpoint({...editingEndpoint, [attr]:val})
    }
    
    const isEmpty = (()=>{
        const entries = Object.entries(editingEndpoint)
        return !entries.some((keyVal)=>{
            if(keyVal[0] !== "index") return keyVal[1].length
        })
    })()
    
    const handleDoneAction = ()=>{
        if(isEmpty){
            // Delete endpoint if empty after confirmed done editing
            doneAction("DELETE")
        }else{
            setEndpoints(endpoints.map((ep)=>{
                if(ep.index === editingEndpoint.index){
                    return editingEndpoint
                }else{
                    return ep
                }
            }))
            doneAction()
        }
    }

    // useEffect(()=>{
    //     // return ()=>
    //     return ()=> {
    //         isEmpty?setEndpoints(endpoints.map((ep)=>{
    //             if(ep.index === editingEndpoint.index){
    //                 return editingEndpoint
    //             }else{
    //                 return ep
    //             }
    //         })):null
    //     }
    // }, [])
    
    return(<View style={{paddingHorizontal:20}}>
                <InputView icon="whatsapp" title="WhatsApp Number" placeholder="e.g 2347079574758" keyboardType="phone-pad" value={whatsappNumber} setAction={(val:string)=>handleSetEditingAttr("whatsappNumber", val)} />
                <InputView icon="instagram" title="Instagram username" placeholder="Softmier" keyboardType="default" value={instagramUsername} setAction={(val:string)=>handleSetEditingAttr("instagramUsername",val)} />
                <InputView icon="twitter" title="Twitter ID" placeholder="39238474" keyboardType="phone-pad" value={twitterID} setAction={(val:string)=>handleSetEditingAttr("twitterID", val)} />
                <InputView icon="facebook" title="Facebook Page username" placeholder="Softmier" keyboardType="default" value={facebookPageName} setAction={(val:string)=>handleSetEditingAttr("facebookPageName", val)} />
                <Divider style={{marginTop:10}} />
                <Text>Use a label to distinguish between various collections</Text>
                <InputView icon="label" title="Collection Label" placeholder="My Real Estate Endpoints" keyboardType="default" value={label} setAction={(val:string)=>handleSetEditingAttr("label", val)} />
                <View style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
                    <Button mode='outlined' onPress={()=>doneAction()}>Cancle</Button>
                    <Button mode='contained' onPress={handleDoneAction}>{isEmpty?"Delete":"Done"}</Button>
                </View>
    </View>)
}
export const EndpointsList:FC<{endpoints:endpoint[], setEndpoints:Function}> = ({endpoints, setEndpoints})=>{
    const [editingID, setEditingID] = useState("")
    const editingEndpoint = endpoints.filter((ep)=>ep.index === editingID)[0]
    // const [endpoint, setEndpoint] = useState<endpoint>()
    const deleteEndpoint = (id:string)=>{
        setEndpoints(endpoints.filter((ep)=>ep.index !== id))
    }
    const doneAction = (actionType?:string)=>{
        let deletedID = editingID
        setEditingID("")
        actionType === "DELETE"?deleteEndpoint(deletedID):null
    }
    return(
        <View style={{height:"100%"}}>
            <Modal visible={Boolean(editingID)}>
                <View style={{padding:20}}>
                    <Text style={{textAlign:"center", fontSize:16}}>Edit Endpoint</Text>
                    <Text style={{textAlign:"center"}}>{editingID && editingEndpoint.label?editingEndpoint.label:editingID}</Text>
                </View>
                <ScrollView>
                    <EditEndpoint endpoint={editingEndpoint} endpoints={endpoints} setEndpoints={setEndpoints} doneAction={doneAction} />
                </ScrollView>
            </Modal>
            {
                endpoints.map((ep:endpoint)=>
                <View key={ep.index} style={{marginBottom:10, paddingBottom:10}}>
                    <View style={{display:"flex", flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
                        {
                            ep.label?
                            <Text style={{left:0, position:'relative', fontWeight:"800"}}>{ep.label?ep.label:"[No label]"}</Text>
                            :
                            <Text style={{left:0, position:'relative', fontStyle:"italic"}}>[Not labeled]</Text>
                        }
                        <Button mode='outlined' onPress={()=>setEditingID(ep.index)}>Edit</Button>
                    </View>
                    <View style={{display:"flex", flexDirection:"row", alignItems:"center"}}><IconButton icon="whatsapp" /><Text>Whatsapp: {ep.whatsappNumber}</Text></View>
                    <View style={{display:"flex", flexDirection:"row", alignItems:"center"}}><IconButton icon="instagram" /><Text>Instagram: {ep.instagramUsername}</Text></View>
                    <View style={{display:"flex", flexDirection:"row", alignItems:"center"}}><IconButton icon="facebook" /><Text>FB Page Name: {ep.facebookPageName}</Text></View>
                    <View style={{display:"flex", flexDirection:"row", alignItems:"center"}}><IconButton icon="twitter" /><Text>Twitter ID: {ep.twitterID}</Text></View>
                    <Divider />
                </View>
                )
            }
        </View>
    )
}
export const CreateEndpoint:FC<{endpoints:endpoint[], setEndpoints:Function, createNewEndpointRequestCount:number}> = ({endpoints, setEndpoints, createNewEndpointRequestCount})=>{

    const [newEndpoint, setNewEndpoint] = useState<endpoint>({...emptyEndpoint, index:generateRandomKey()})
    const [addNewEndpoint, setAddNewEndpoint] = useState(true)
    const {whatsappNumber, twitterID, instagramUsername, facebookPageName, label, index} = newEndpoint

    const handleSetEnpointAttr = (attr:string, val:string)=>{
        setNewEndpoint({...newEndpoint, [attr]:val})
        if(addNewEndpoint){
            setEndpoints([...endpoints, newEndpoint])
            setAddNewEndpoint(false)
        }
    }

    const createNew = ()=>{
        const entries = Object.entries(newEndpoint)
        if(entries.some((keyVal)=>{
            if(keyVal[0] !== "index") return keyVal[1].length
        })){
            // Create New Endpoint
            setNewEndpoint({...emptyEndpoint, index:generateRandomKey()})
        }
    }
    useEffect(()=>{
        if(createNewEndpointRequestCount){
            createNew();
        }
    }, [createNewEndpointRequestCount])
    useEffect(()=>{
        if(endpoints.length){
            const entries = Object.entries(newEndpoint)
            if(entries.some((keyVal)=>{
                if(keyVal[0] !== "index") return keyVal[1].length
            })){
                // Create New Endpoint
                setEndpoints(endpoints.map((ep,id)=>{
                    if(ep.index === index){
                        return newEndpoint
                    }else{
                        return ep
                    }
                }))
            }else{
                // Remove empty endpoint from endpoints list
                setEndpoints(endpoints.filter((ep)=>ep.index !== newEndpoint.index))
            }
        }else{
            // First endpoint to be created
            const entries = Object.entries(newEndpoint)
            if(entries.some((keyVal)=>{
                if(keyVal[0] !== "index") return keyVal[1].length
            })){
                // Create New Endpoint
                setEndpoints([newEndpoint])
            }
        }
    },[newEndpoint])
    return(<>
                <InputView icon="whatsapp" title="WhatsApp Number" placeholder="+267079574758" keyboardType="phone-pad" value={whatsappNumber} setAction={(val:string)=>handleSetEnpointAttr("whatsappNumber", val)} />
                <InputView icon="instagram" title="Instagram username" placeholder="Softmier" keyboardType="default" value={instagramUsername} setAction={(val:string)=>handleSetEnpointAttr("instagramUsername",val)} />
                <InputView icon="twitter" title="Twitter ID" placeholder="39238474" keyboardType="phone-pad" value={twitterID} setAction={(val:string)=>handleSetEnpointAttr("twitterID", val)} />
                <InputView icon="facebook" title="Facebook Page username" placeholder="softmier" keyboardType="default" value={facebookPageName} setAction={(val:string)=>handleSetEnpointAttr("facebookPageName", val)} />
                <Divider />
                <Text>Use a label to distinguish between various collections</Text>
                <InputView icon="label" title="Collection Label" placeholder="Marketing" keyboardType="default" value={label} setAction={(val:string)=>handleSetEnpointAttr("label", val)} />
    </>)
}
export const SettingsPage:FC<{navigation?:NavigationAction}> = ({navigation}) => {

    const [endpoints, setEndpoints] = useMMKVStorage("endpoints", MKKV, [])
    const [createNewEndpointRequestCount, setCreateNewEndpointRequestCount] = useState(0)

    const [isCreating, setIsCreating] = useState(endpoints.length?false:true)

    const handleCreateNew = ()=>{
        setIsCreating(true)
        let previousCount = createNewEndpointRequestCount
        setCreateNewEndpointRequestCount(previousCount++)
    }

    const dayNightMode = useColorScheme();
    return(
        <View style={{flex:1, backgroundColor:theme.colors.backgroundColor}}>
            <View style={{paddingHorizontal:20, paddingVertical:20}}>
                <View style={{}}>
                    <Text style={{textAlign:"justify"}}>An endpoint is where you want users of your generated link to send a message to. So an endpoint for your business whatsapp would be the registered business whatsapp number</Text>
                </View>
                <View style={{display:"flex", flexDirection:"row", justifyContent:"space-between", marginTop:20, borderBottomColor:"indigo", borderBottomWidth:1}}>
                    <Button mode={!isCreating?"contained":"text"} style={{borderRadius:0}} onPress={()=>setIsCreating(false)}>
                        <Text style={{color:!isCreating?"white":theme.colors.primary}}>Existing ({endpoints.length})</Text>
                    </Button>
                    <Button mode={isCreating?"contained":"text"} style={{borderRadius:0}} onPress={()=>handleCreateNew()}><Text style={{color:isCreating?"white":theme.colors.primary}}>New</Text></Button>
                </View>
            </View>
                <FAB icon="plus" mode='elevated' style={{position:"absolute", bottom:50, right:5, shadowOffset:{width:0, height:0}}}></FAB>
            {
                !endpoints.length && !isCreating?
                <View style={{display:"flex", height:"60%", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
                    <Text style={{textAlign:"center", fontSize:18, fontWeight:"100", fontStyle:"italic"}}>You haven't added an enpoint yet</Text>
                    <Button mode='outlined' style={{marginTop:20}} onPress={()=>setIsCreating(true)}><Text>Create Endpoint</Text></Button>
                </View>
                :
                <ScrollView>
                    <View style={{paddingHorizontal:20, paddingVertical:20}}>
                        {isCreating?
                            <CreateEndpoint endpoints={endpoints} setEndpoints={setEndpoints} createNewEndpointRequestCount={createNewEndpointRequestCount} />
                        :
                            <EndpointsList endpoints={endpoints} setEndpoints={setEndpoints} />
                        }
                    </View>
                </ScrollView>
            }
        </View>
    )
}

