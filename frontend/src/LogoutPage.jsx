import { useEffect, useState } from 'react'
import styled from 'styled-components'

const Page = styled.div`
    width:100vw;
    height: 40vh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-around;

    h1{
        text-align: center;
    }
`

const LogoutPage = ({AssociationContext}) => {
    /**
     const AssociationContext = {
            jwt: jwt,
            update_jwt: update_jwt,
            username: username,
            updateUsername: updateUsername,
        }
     */
    const [counter, updateCounter] = useState(3);
    const [status, updateStatus] = useState();

    function redirect_page(){
        updateStatus(`Redirecting to dataviewer`);
        setInterval(() => {
            window.location.href = '/';
        }, 1000);
    }

    useEffect(()=>{
        console.log('[Logout] first init')
        console.log('Logout');
        console.log('Erase session');
        localStorage.removeItem('association');
        AssociationContext.update_jwt('');
        AssociationContext.updateUsername('');
        setTimeout(()=>{
            redirect_page();
        }, 2000)
    },[])

    
    return <Page>
        <h1>Logging out your account</h1>
        <span>Please wait ... </span>
        <span>{status}</span>
    </Page>
}

export default LogoutPage;