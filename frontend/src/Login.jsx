import React, { useState } from "react";
import styled from "styled-components";
import axios from 'axios';

const PageWrapper = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    .dialog{
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3rem;
        border: 1px solid black;
        border-radius: 1rem;
    }

    .formbox{
        margin-top: 1rem;
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        
        input{
            text-align: center;
        }
    }
`

const LoginPage = ({AssociationContext}) => {
    const [email, updateEmail] = useState('');
    const [password, updatePassword] = useState('');

    return (
        <PageWrapper>
            <div className="dialog">
                <span>Login</span>
                <div className="formbox">
                    <input value={email} onChange={(e)=>updateEmail(e.target.value)} placeholder="email"></input>
                    <input value={password} onChange={(e)=>updatePassword(e.target.value)} type='password' placeholder="password"></input>
                </div>
                <button onClick={()=>{
                    const payload = {
                        email: email,
                        password: password
                    }

                    axios.post("http://10.23.40.185/api/auth/local", payload)
                        .then((response) => {
                            AssociationContext.update_jwt(response.data.jwt);
                            AssociationContext.updateUsername(response.data.username);  
                            let data_tobe_saved = response.data;
                            data_tobe_saved['email'] = email;

                            localStorage.setItem('association', JSON.stringify(data_tobe_saved));
                            window.location.href = '/';
                        })
                        .catch((error) => {console.log(error)
                        });
                    
                }}>login</button>
                <a href={`/register`}><span>register here</span></a>
            </div>
        </PageWrapper>
    )
}

export default LoginPage;