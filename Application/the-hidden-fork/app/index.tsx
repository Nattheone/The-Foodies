import { Redirect } from "expo-router";
import * as React from 'react'; 

// The group uses the page so that we can redirect to the getstarted page upon the app initializing (the only way the app would work for some reason)

const StartPage = () =>{
  return <Redirect href="/tabs/GetStarted"/>
  
};
export default StartPage