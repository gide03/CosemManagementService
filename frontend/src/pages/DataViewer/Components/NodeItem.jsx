import styled from "styled-components";
import { useState, useContext } from "react";
import { WorkItemPresentationContext } from "../Context/WorkitemContext";

const ItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: smaller;
  margin-bottom: 0.75rem;
  box-sizing: border-box;

  .title {
    span {
      background-color: #eeeeee;
      padding: 0.25rem;
    }
  }

  .node-end-point {
    margin-left: 0.5rem;
    cursor: pointer;
    span {
      margin-left: 0.25rem;
    }
  }

  .node-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .i-active {
    border: 1px solid black;
  }

  .additional-info {
    font-size: smaller;
  }

  .highlight {
    background-color: #eeeeee;
    padding: 0.1rem 0.5rem 0.1rem 0.5rem;
    font-size: smaller;
    font-style: italic;
    border-radius: 6px;
  }
`;

const ListView = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  width: 30%;
  overflow: scroll;
`;

const NodeTree = ({
  element,
  activeNodeTreeId,
  onClick,
  updateState,
  childIdx = -1,
  hideAll,
}) => {
  const [hide, updateHide] = useState(element.hidden);
  const dtype = element._dtype;

  return (
    <div className={`node-end-point`}>
      {dtype === "Array" || dtype === "Structure" ? (
        <>
          <div
            onClick={() => onClick(element)}
            className={`node-container ${
              activeNodeTreeId === element.id ? "i-active" : ""
            }`}
          >
            <div>
              <button
                onClick={(event) => {
                  console.log(event);
                  if (event.ctrlKey) {
                    return;
                  }
                  updateHide(!hide);
                }}
              >
                hide
              </button>
              <span>
                {`${dtype}`}
                {dtype === "Structure" && element.id.includes("-") && (
                  <span className="additional-info highlight">
                    {" "}
                    {`(Index ${childIdx})`}{" "}
                  </span>
                )}
              </span>
            </div>
            {dtype === "Array" ? (
              <div>
                <button
                  onClick={() => {
                    console.log("append child");
                  }}
                >
                  +
                </button>
                <button
                  onClick={() => {
                    console.log("remove child");
                  }}
                >
                  -
                </button>
                <span className="additional-info">{`${element.children.length} to ${element.maxValue} elements`}</span>
              </div>
            ) : (
              <></>
            )}
          </div>
          {!hide &&
            element.children.map((child, idx) => {
              return (
                <NodeTree
                  key={`node-${idx}-${element.id}`}
                  element={child}
                  activeNodeTreeId={activeNodeTreeId}
                  onClick={(element) => onClick(element)}
                  childIdx={idx}
                ></NodeTree>
              );
            })}
        </>
      ) : (
        <div
          className={`${activeNodeTreeId === element.id ? "i-active" : ""}`}
          onClick={() => onClick(element)}
        >
          {dtype}
        </div>
      )}
    </div>
  );
};

const NodeView = () => {
  const { workItem, updateWorkItem, onClicked, activeNodeTreeId } = useContext(
    WorkItemPresentationContext
  );

  const hideAllElement = (nodeElement, _flagRecursive = false) => {
    nodeElement.hidden = true;
    for (let child in nodeElement) {
      hideAllElement(child, true);
    }
    // to make sure update work item just once
    if (!_flagRecursive) {
      updateWorkItem();
    }
  };

  if (workItem == null) {
    return <></>;
  }
  console.log(`Render nodeview`);
  const attributes = workItem.attribute;
  return (
    <ListView>
      {attributes.map((element, idx) => {
        return (
          <ItemWrapper key={`Att ${idx + 1}`}>
            <div>
              <span>Att {element.id}</span> {element.title}
            </div>
            <NodeTree
              onClick={onClicked}
              element={element}
              updateState={updateWorkItem}
              activeNodeTreeId={activeNodeTreeId}
            ></NodeTree>
          </ItemWrapper>
        );
      })}
    </ListView>
  );
};

export default NodeView;
