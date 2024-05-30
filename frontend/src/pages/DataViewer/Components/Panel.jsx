import styled from "styled-components";

const StyledPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 20rem;
  height: 100%;
  border: 1px solid black;
  div {
    box-sizing: border-box;
  }
`;

const StyledScrollBoxContainer = styled.div`
  display: flex;
  overflow: hidden scroll;
  flex-direction: column;
  height: 80rem;
  width: 100%;

  :hover {
    cursor: pointer;
    background-color: rgb(230, 230, 240);
  }

  .active {
    background-color: rgb(230, 230, 240);
    border: 1px solid black;
  }
`;

const StyledPanelTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3rem;
  width: 100%;
  padding: 0.5rem;
  background-color: rgb(230, 230, 230);

  span {
    font-weight: bold;
    width: 80rem;
    text-align: left;
  }

  input {
    width: 10rem;
  }
`;

const StyledScrollBoxItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 2rem;
  padding: 0.3rem 0.5rem 0.3rem 0.5rem;
  font-size: smaller;
`;

const PanelContainer = ({
  title = "Title",
  itemList = [],
  showSearchBox = true,
  showDeleteItem = true,
  activeItem = "",
  onDelete = (item) => {},
  onItemClicked = (item) => {},
}) => {
  /**
   * itemClickEventFilter
   * filter where is the cursor click, is it a button, span, etc. Each element may have its own click handler
   *
   * @param {*} event `event`
   * @param {*} item  `string`
   */
  const itemClickEventFilter = (event, item) => {
    // console.debug(`Click event filter ${item}`);
    console.debug(event);
    if (event.target.tagName === "BUTTON") {
      event.preventDefault();
      onDelete(item);
      return;
    }
    onItemClicked(item);
  };

  return (
    <StyledPanelContainer>
      <StyledPanelTitleContainer>
        <span id={`PanelContainer-${title}`}>{title}</span>
        {showSearchBox ? <input placeholder="Search"></input> : <></>}
      </StyledPanelTitleContainer>
      <StyledScrollBoxContainer>
        {itemList.map((item, idx) => {
          return (
            <StyledScrollBoxItem
              key={`${title}-${idx}`}
              className={item === activeItem ? "active" : ""}
              onClick={(event) => itemClickEventFilter(event, item)}
            >
              <span>{item}</span>
              {showDeleteItem ? (
                <button onClick={(event) => itemClickEventFilter(event, item)}>
                  delete
                </button>
              ) : (
                <></>
              )}
            </StyledScrollBoxItem>
          );
        })}
      </StyledScrollBoxContainer>
    </StyledPanelContainer>
  );
};

export default PanelContainer;
