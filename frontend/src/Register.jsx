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

const RegisterPage = () => {
    const [username, updateUsername] = useState('');
    const [email, updateEmail] = useState('');
    const [password, updatePassword] = useState('');

    function register_handler() {
        const payload = {
            username : username,
            email : email,
            password : password
        }

        axios.post("http://10.23.40.185/api/auth/register", payload)
        .then((response) => {
            let data_tobe_saved = response.data;
            data_tobe_saved['email'] = email;

            localStorage.setItem('association', JSON.stringify(data_tobe_saved));
            window.location.href = '/';
        })
        .catch((error) => {console.log(error)
        });
    }

    return (
        <PageWrapper>
            <div className="dialog">
                <span>Account Registration</span>
                <div className="formbox">
                    <input value={username} onChange={(event)=>updateUsername(event.target.value)} placeholder="username"></input>
                    <input value={email} onChange={(event)=>updateEmail(event.target.value)} placeholder="email"></input>
                    <input value={password} onChange={(event)=>updatePassword(event.target.value)} type='password' placeholder="password"></input>
                </div>
                <button onClick={register_handler}>Register</button>
                <a href={`/login`}><span>Login here</span></a>
            </div>
        </PageWrapper>
    )
}

export default RegisterPage;