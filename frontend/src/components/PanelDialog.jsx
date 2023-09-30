import styled from 'styled-components'

export const StyledPanel = styled.div`
    width: 30%;
    height: 80%;
    border: 1px solid black;
    /* overflow: hidden scroll; */
    display:flex;
    flex-direction: column;
    user-select:none;
    box-sizing: border-box;
`

export const StyledBoxTitle = styled.div`
    width: 100%;
    position: sticky;
    top:0;
    background-color: gray;
    padding: 3px 1rem 3px 2px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`