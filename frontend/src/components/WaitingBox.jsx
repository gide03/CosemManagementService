import styled, {keyframes} from 'styled-components'

const spin = keyframes`
    0% {transform: rotate(0deg);}
    100% {transform: rotate(360deg);}
`;

const Loader = styled.div`
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: ${spin} 1s linear infinite;
    /* margin: 0 auto; */
    margin-top: 10px;
`

const BoxWaiting = styled.div`
    position: fixed;
    right: 0;
    background-color:red;
    padding:1rem;
    z-index: 100;
    display:flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.4s;

    .active{
        
    }
`

const WaitingBox = ({message, className}) => {
    return <BoxWaiting className={className}>{message} <Loader></Loader></BoxWaiting>
}

export default WaitingBox;