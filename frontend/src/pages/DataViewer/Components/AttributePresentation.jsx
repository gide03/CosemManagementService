import { useContext, useEffect, useState } from "react";
import { WorkItemPresentationContext } from "../Context/WorkitemContext";
import GroupBox from "./GroupBox";
import styled from "styled-components";

const ContentWrapper = styled.div`
  width: 70%;
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;

  overflow: hidden scroll;

  table {
    font-size: smaller;

    .collapse{
    }
    
    .tr-primary{
      background-color: #747474ba;
      color: white;
    }

    .tr-secondary{
      background-color: #d2d2d2ba;
    }

  }

  th {
    text-align: left;
  }

  .enum-code{
    text-align: center;
  }
  
  
`;

const ObjectInformation = () => {
  const { workItem } = useContext(WorkItemPresentationContext);
  if (workItem == null) {
    return <></>;
  }

  return (
    <table>
      <tbody>
        <tr>
          <th>Object Name</th>
          <td>{workItem.objectName}</td>
        </tr>
        <tr>
          <th>Logical Name</th>
          <td>{workItem.logicalName}</td>
        </tr>
        <tr>
          <th>Class ID</th>
          <td>{workItem.classId}</td>
        </tr>
        <tr>
          <th>Comment</th>
          <td>{workItem.comment}</td>
        </tr>
      </tbody>
    </table>
  );
};

const AttributeInformation = () => {
  const { workItem, activeNode, activeNodeTreeId } = useContext(
    WorkItemPresentationContext
  );
  const AccessRights = () => {
    const rootNodeId = parseInt(activeNodeTreeId[0]);
    const accessRights = workItem.accessRight;
    const clientList = Object.keys(accessRights);
    const clientAccessRight = clientList.map((clientElement) => {
      return accessRights[clientElement]["attribute"][rootNodeId - 1];
    });

    // console.debug("Access Rights UI");
    // console.debug(rootNodeId);
    // console.debug(accessRights);
    // console.debug(clientAccessRight);

    return (
      <table>
        <tbody>
          {clientList.map((acElement, idx) => {
            return (
              <tr key={`row-${acElement}-ac`}>
                <th>{acElement}</th>
                <td>{clientAccessRight[idx]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <table>
      <tbody>
        <tr>
          <th>Attribute name</th>
          <td>{activeNode.title}</td>
        </tr>
        <tr>
          <th>Comment</th>
          <td>
            <textarea></textarea>
          </td>
        </tr>
        <tr>
          <th>Access Rights</th>
          <td>
            <AccessRights></AccessRights>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const DetailedInformation = () => {
  const {activeNode} = useContext(WorkItemPresentationContext);
  const [defaultValue, setDefaultValue] = useState(activeNode.defaultValue);
  const [minValue, setMinValue] = useState(activeNode.minValue);
  const [maxValue, setMaxValue] = useState(activeNode.maxValue);
  const [modifier, setModifier] = useState(activeNode.modifier);
  const [isChoice, setIsChoice] = useState(activeNode.isChoice);

  // const [isAscii, setIsAscii] = useState(activeNode.is_ASCII);
  // const [isBytes, setIsBytes] = useState(activeNode.is_ByteArray);
  // const [isString, setIsString] = useState(activeNode.is_VisibleString);

  useEffect(()=>{
    console.log('Change active node')
    setDefaultValue(activeNode.defaultValue)
    setMinValue(activeNode.minValue)
    setMaxValue(activeNode.maxValue)
    setModifier(activeNode.modifier)

    // if (activeNode.is_ASCII && activeNode.is_ByteArray && activeNode.is_VisibleString){
    //   update_octetStringView(1);
    // }
  }, [activeNode])

  const update_defaultValue = (value) => {
    activeNode.defaultValue = value;
    setDefaultValue(value);
  }
  const update_minValue = (value) => {
    activeNode.minValue = value;
    setMinValue(value);
  }
  const update_maxValue = (value) => {
    activeNode.maxValue = value;
    setMaxValue(value);
  }
  const update_modifier = (value) => {
    activeNode.modifier = value;
    setModifier(value);
  }
  const update_stringLength = (value) => {
    activeNode.minValue = value; setMinValue(value);
    activeNode.maxValue = value; setMaxValue(value);
  }
  const update_isChoice = (value) => {
    activeNode.isChoice = value;
    setIsChoice(value);
  }
  // const update_octetStringView = (value) => {
  //   /**
  //    * value: (1) byte array (2) ascii (3) visible string
  //    */
  //   if (value === 1){
  //     activeNode.is_ByteArray = true; setIsBytes(true);
  //     activeNode.is_ASCII = false; setIsAscii(false);
  //     activeNode.is_VisibleString = false; setIsString(false);
  //   }else if(value == 2){
  //     activeNode.is_ByteArray = false; setIsBytes(false);
  //     activeNode.is_ASCII = true; setIsAscii(true);
  //     activeNode.is_VisibleString = false; setIsString(false);
  //   }else if(value == 3){
  //     activeNode.is_ByteArray = false; setIsBytes(false);
  //     activeNode.is_ASCII = false; setIsAscii(false);
  //     activeNode.is_VisibleString = true; setIsString(true);
  //   }
  // }

  /**
   * TODO [1]: Render Structure data structure
   * TODO [2]: Render Array
   * TODO [3]: Render if data could be enumerated
   * TODO [4]: 
   */
  if (activeNode._dtype === 'Structure'){
    return <div>Structure</div>
  }
  else if (activeNode._dtype === 'Array'){
    return <div>Array</div>
  }
  else if (
    activeNode._dtype === 'EnumeratedDTO' ||
    Object.keys(activeNode.enumChoices).length > 0 ||
    activeNode.isChoice
  ){
    return <div>
      <h3>Enumeration Info</h3>
      <table className='collapse grid'>
        <thead>
          <tr className="tr-primary">
            <th>Enum Code</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(activeNode.enumChoices).map((enum_code, idx) => {
              return <tr className={idx%2==0 && "tr-secondary"} key={`${activeNode.title}-enum-info-${enum_code}`}>
                <td className='enum-code'>{enum_code}</td>
                <td>{activeNode.enumChoices[enum_code]}</td>
              </tr>
            })
          }
        </tbody>
      </table>

      <h3>Value Info</h3>
      <table>
        <tbody>
          <tr>
            <th>Default Value</th>
            <td>
              <select value={activeNode.defaultValue} onChange={(e)=>{update_defaultValue(e.target.value)} }>
                {
                  Object.keys(activeNode.enumChoices).map((enum_key) => {
                    console.log(activeNode.defaultValue);
                    return <option key={`${activeNode.title}-option-${enum_key}`} value={enum_key}>{`(${enum_key}) ${activeNode.enumChoices[enum_key]}`}</option>
                  })
                }
              </select>
            </td>
          </tr>
          <tr>
            <th>Modifier</th>
            <td><input type='text' defaultValue={activeNode.modifier} onChange={(e)=>{update_modifier(e.target.value)}}></input></td>
          </tr>
          {activeNode._dtype.includes('Unsigned') && <tr>
            <td>
                <label>
                  <input type='checkbox' checked={activeNode.isChoice} onChange={(e)=>{update_isChoice(e.target.checked)}}></input> Set as enumearted?
                </label>
              </td>
          </tr>}
        </tbody>
      </table>
    </div>
  }
  else{
    return <div>
      <table>
        <tbody>
          <tr>
            <th>Default Value</th>
            <td>
              <input type='text' value={activeNode.defaultValue} onChange={(e)=>{update_defaultValue(e.target.value)}}></input>
            </td>
            {/* {
              activeNode._dtype.includes('OctetString') && <>
                <th>View As</th>
                <td><label><input type='checkbox' checked={activeNode.is_ByteArray} onChange={()=>update_octetStringView(1)}></input> Bytes</label></td>
                <td><label><input type='checkbox' checked={activeNode.is_ASCII} onChange={()=>update_octetStringView(2)}></input> ASCII</label></td>
                <td><label><input type='checkbox' checked={activeNode.is_VisibleString} onChange={()=>update_octetStringView(3)}></input> VisibleString</label></td>
              </>
            } */}
          </tr>
          {
            activeNode._dtype.includes('OctetString') ? 
            <tr>
              <th>Length</th>
              <td>
                <input type='text' value={activeNode.maxValue} onChange={(e)=>{update_stringLength(e.target.value)}}></input>
              </td>
            </tr>:
            <>
              <tr>
                <th>Min Value</th>
                <td>
                  <input type='text' value={activeNode.minValue} onChange={(e)=>{update_minValue(e.target.value)}}></input>
                </td>
              </tr>
              <tr>
                <th>Max Value</th>
                <td>
                  <input type='text' value={activeNode.maxValue} onChange={(e)=>{update_maxValue(e.target.value)}}></input>
                </td>
              </tr>
            </>
          }
          <tr>
            <th>Modifier</th>
            <td>
              <input type='text' value={activeNode.modifier} onChange={(e)=>{update_modifier(e.target.value)}}></input>
            </td>
          </tr>
          {
            activeNode._dtype.includes('Unsigned') && <tr>
              <td>
                <label>
                  <input type='checkbox' onChange={(e)=>{update_isChoice(e.target.checked)}}></input> Set as enumearted?
                </label>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
  
}

const AttributePresentation = () => {
  const mContext = useContext(WorkItemPresentationContext);
  // const activeNode = mContext.activeNode;
  // const [dtype, setDtype] = useState(activeNode.dtype);
  // const [defaultValue, setDefaultValue] = useState(activeNode.defaultValue);
  // const [minValue, setMinValue] = useState(activeNode.minValue);
  // const [maxValue, setMaxValue] = useState(activeNode.maxValue);
  // const [accessRight, setAccessRight] = useState(activeNode.accessRight);
  // const [modifier, setModifier] = useState(activeNode.modifier);

  // useEffect(() => {
  //   setDefaultValue(activeNode.defaultValue);
  //   setMinValue(activeNode.minValue);
  //   setMaxValue(activeNode.maxValue);
  //   setAccessRight(activeNode.accessRight);
  //   setModifier(activeNode.modifier);
  // }, [mContext.activeNode]);

  return (
    <ContentWrapper>
      <GroupBox title="Object Information">
        <ObjectInformation></ObjectInformation>
      </GroupBox>
      <GroupBox title="Attribute Information">
        <AttributeInformation></AttributeInformation>
      </GroupBox>
      <GroupBox title="Details">
        <DetailedInformation></DetailedInformation>
      </GroupBox>
    </ContentWrapper>
  );
};

export default AttributePresentation;
