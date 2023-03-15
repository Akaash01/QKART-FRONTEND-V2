import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Search, SentimentDissatisfied } from "@mui/icons-material";
import { Avatar, Button, Stack,TextField,InputAdornment } from "@mui/material";
import {useState,useEffect} from "react";
import {Link,useHistory} from "react-router-dom";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
    const [username,setUsername]= useState();
    const history = useHistory();
    useEffect(()=>{
      const name = localStorage.getItem('username');
      setUsername(name);
    },[])
    const logoutHandler=()=>{
      localStorage.clear();
      history.push('/login');
    }
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        { children }
        { !hasHiddenAuthButtons ? (<Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={()=> history.push('/')}
        >
          Back to explore
        </Button>):(
          username?(
            <div className="avatar-wrapper">
               <Avatar alt={username} src="/public/avatar.png"></Avatar>
               {username}
               <Button onClick={logoutHandler}>Logout</Button>
            </div>
          ):(hasHiddenAuthButtons && <div>
            <Button variant="text" onClick={()=> history.push('/login')}>Login</Button>
            <Button variant="contained" onClick={()=> history.push('/register')}>Register</Button>
          </div>)
        )}
      </Box>
    );
};

export default Header;
