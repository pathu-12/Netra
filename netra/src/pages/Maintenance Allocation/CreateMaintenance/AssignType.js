import {
  Button,
  Dialog,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  makeStyles,
} from "@material-ui/core";
import { AgGridColumn } from "ag-grid-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import CustomizedSnackbars from "../../../ui/CustomSnackBar";
import { treeDataActions } from "../../../store/TreeDataStore";
import Table from "../../../ui/Table/Table";
import styles from "./CreateMaintenance.module.css";
import { saveSensor } from "./SaveHandler";
import UserSelection from "../../../ui/userSelection/userSelection";
import Navigation from "../../../components/navigation/Navigation";

const useStyles = makeStyles({
  buttons: {
    margin: 5,
    minWidth: 170,
    float: "right",
  },
  align: {
    marginBottom: 10,
  },
});

const headers = [
  "name",
  "unit",
  "min",
  "max",
  "P",
  "F",
  // 'level',
  "frequency",
  // 'data',
];

function downloadBlankCSV() {
  const csvContent = headers.join(",");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "blank_data.csv";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

const AssignType = (props) => {
  const [type, setType] = useState("");
  const [ageBasedUnit, setAgeBasedUnit] = useState(null);
  const [Rtype, setRtype] = useState("Repairable");
  const [calendarBasedUnit, setCalendarBasedUnit] = useState(null);
  const [condition, setCondition] = useState("sensorBased");
  const [failureMode, setFailureMode] = useState(null);
  const [visualWearLevels, setVisualWearLevels] = useState(0);
  const [visualCorrosionLevels, setVisualCorrosionLevels] = useState(0);
  const [visualFrequency, setVisualFrequency] = useState(0);
  const [degradationWearLevels, setDegradationWearLevels] = useState(0);
  const [pRows, setpRows] = useState([]);
  const [VisualWearRows, setVisualWearRows] = useState([]);
  const [VisualCorrosionRows, setVisualCorrosionRows] = useState([]);
  const [visualActionsRows, setVisualActionRows] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const fileInputRef = useRef(null);
  const hello = ["This", "is", "beauty"];
  const classes = useStyles();
  const dispatch = useDispatch();

  const CurrentSelected = useSelector(
    (state) => state.userSelection.currentSelection
  );
  const sData = useSelector((state) => state.userSelection.componentsData);

  const currentNomenclature = CurrentSelected["nomenclature"];
  console.log(currentNomenclature);
  const matchingItems = sData.filter(
    (item) => item.nomenclature === currentNomenclature
  );
  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        const rows = csvData.split("\n");

        // Assuming the first row contains column headers
        const headers = rows[0].split(",").map((header) => header.trim());
        const parsedData = [];

        for (let i = 1; i < rows.length; i++) {
          const rowData = rows[i].split(",");
          if (rowData.length === headers.length) {
            // Check if the number of columns matches the headers
            const rowObject = {};
            for (let j = 0; j < headers.length; j++) {
              let value = rowData[j].trim();
              rowObject[headers[j]] = value;
              rowObject["id"] = uuid();
              rowObject["EquipmentId"] = eqptId;
              rowObject["ComponentId"] = matchingId;
            }
            parsedData.push(rowObject);
          }
        }

        // Now it's parsedData, not paramData
        // Here, you can dispatch or do something else with the parsed data
        setpRows(parsedData);
      };

      reader.readAsText(file);
    }
  };

  const changeVisualFrequency = (e) => {
    setVisualFrequency(e.target.value);
  };
  const changeVisualWearLevel = (e) => {
    setVisualWearLevels(e.target.value);
    addVisualWearRows(e.target.value);
  };
  const changeVisualCorrosionLevel = (e) => {
    setVisualCorrosionLevels(e.target.value);
    addVisualCorrosionRows(e.target.value);
  };
  const changeDegradationWearLevel = (e) => {
    setVisualWearLevels(e.target.value);
  };
  const handleMtypeChange = (e) => {
    setType(e.target.value);
  };
  useEffect(() => {
    addVisualActionRows();
  }, [VisualWearRows, VisualCorrosionRows]);

  const addVisualWearRows = (n) => {
    let newRows = [];
    let i = 1;
    while (n > 0) {
      newRows = [...newRows, { level: `L${i}`, wear: "", image: "" }];
      n--;
      i++;
    }
    console.log(newRows);
    setVisualWearRows(newRows);
  };

  const addVisualCorrosionRows = (n) => {
    let newRows = [];
    let i = 1;
    while (n > 0) {
      newRows = [...newRows, { level: `L${i}`, corrosion: "", image: "" }];
      n--;
      i++;
    }
    console.log(newRows);
    setVisualCorrosionRows(newRows);
  };

  const matchingId = matchingItems[0]?.id;
  const addVisualActionRows = () => {
    let rows = [];
    VisualWearRows.map((wearRow) => {
      VisualCorrosionRows.map((corrosionRow) => {
        rows = [
          ...rows,
          {
            wear: wearRow.level,
            corrosion: corrosionRow.level,
            alarm: "Show on dashboard",
            invalid: false,
          },
        ];
      });
    });
    console.log(rows);
    setVisualActionRows(rows);
  };
  // Snackbar
  const [SnackBarMessage, setSnackBarMessage] = useState({
    severity: "error",
    message: "This is awesome",
    showSnackBar: false,
  });
  const onHandleSnackClose = () => {
    setSnackBarMessage({
      severity: "error",
      message: "Please Add Systemss",
      showSnackBar: false,
    });
  };
  //Condition modal
  const [modal, setModal] = useState(false);
  //Sensor Based Monitoring
  const [monitoringType, setMonitoringType] = useState("intermittent");
  const [numPara, setNumPara] = useState(0);

  console.log(pRows);
  const addPRows = (n) => {
    let newRows = [];
    while (n > 0) {
      newRows = [
        ...newRows,
        {
          EquipmentId: eqptId,
          ComponentId: matchingId,
          id: uuid(),
          name: "",
          unit: "",
          min: "",
          max: "",
          frequency: "",
          // data: "",
        },
      ];
      n--;
    }
    console.log(newRows);
    setpRows(newRows);
  };

  const parameterColumnDefs = [
    <AgGridColumn
      field="name"
      headerName="Channel/Parameter Name"
      headerTooltip="Channel/Parameter Name"
      // minWidth={100}
      editable={true}
    />,
    <AgGridColumn
      field="unit"
      headerName="Unit"
      headerTooltip="Unit"
      // minWidth={100}
      editable={true}
    />,
    <AgGridColumn
      field="min"
      headerName="Minimum Value"
      headerTooltip="Minimum Value"
      // minWidth={100}
      editable={true}
    />,
    <AgGridColumn
      field="max"
      headerName="Maximum Value"
      headerTooltip="Maximum Value"
      // minWidth={100}
      editable={true}
    />,
    <AgGridColumn
      field="P"
      headerName="P"
      headerTooltip="P"
      // minWidth={100}
      editable={true}
    />,
    <AgGridColumn
      field="F"
      headerName="F"
      headerTooltip="F"
      // minWidth={100}
      editable={true}
    />,
    monitoringType === "intermittent" ? (
      <AgGridColumn
        field="frequency"
        headerName="Frequency"
        headerTooltip="Frequency"
        // minWidth={100}
        editable={true}
      />
    ) : null,
  ];

  const updateParameterRowData = (allRows) => {
    //get object of levels and lvlwise rows
    let lvlwisearr = [];
    let paramarr = [];
    allRows.map((data) => {
      let lvlarr = [];
      for (let i = 1; i <= data.level; i++) {
        lvlarr.push("L" + i);
        lvlwisearr.push({
          id: uuid(),
          pid: data.id,
          name: data.name,
          level: "L" + i,
          threshold: "",
        });
      }
      paramarr.push(lvlarr);
    });
    setLvlwiseRows(lvlwisearr);
    let result = paramarr.reduce((a, b) =>
      a.reduce((r, v) => r.concat(b.map((w) => [].concat(v, w))), [])
    );
    // console.log(result);
    let rows = [];
    let alarm_att = [];
    result.map((row) => {
      let alarmId = uuid();
      let newrow = { id: alarmId, alarm: "Show on dashboard", invalid: false };
      let i = 0;
      allRows.map((data) => {
        // console.log(row)
        alarm_att = [
          ...alarm_att,
          {
            id: uuid(),
            AlarmId: alarmId,
            paramId: (
              lvlwisearr.filter((element) => {
                return element.name === data.name && element.level === row[i];
              })[0] || {}
            )?.pid,
            lvlId: lvlwisearr.filter((element) => {
              return element.name === data.name && element.level === row[i];
            })[0]?.id,
          },
        ];

        newrow = { ...newrow, [data.name]: row[i] };
        i++;
      });
      console.log(alarm_att);
      rows = [...rows, newrow];
    });

    //console.log(rows)
    setSbAlarmAtts(alarm_att);
    setSbAlarmRows(rows);
    //get columns
    let columns = allRows.map((data) => {
      if (data.name != "") {
        return (
          <AgGridColumn
            field={data.name}
            headerName={data.name}
            headerTooltip={data.name}
            //minWidth={100}
            //editable={true}
          />
        );
      }
    });
    setSbAlarmCols([
      <AgGridColumn
        field="alarm"
        headerName="Alarms"
        headerTooltip="Alarms"
        cellEditor="agSelectCellEditor"
        cellEditorParams={{
          values: ["Show on dashboard", "Alarm1", "Alarm2", "Alarm3"],
        }}
        //minWidth={100}
        editable={true}
      />,
      <AgGridColumn
        headerName="Invalid"
        field="invalid"
        //editable={true}
        cellRenderer={(params) => {
          var input = document.createElement("input");
          input.type = "checkbox";
          input.checked = params.value;
          input.addEventListener("click", function (event) {
            params.value = !params.value;
            params.node.data.invalid = params.value;
          });
          return input;
        }}
      />,
      ...columns,
    ]);
  };
  //sensor-based Alarms Table
  const [sbAlarmCols, setSbAlarmCols] = useState([]);
  const [lvlwiseRows, setLvlwiseRows] = useState([]);
  const [sbAlarmRows, setSbAlarmRows] = useState([]);
  const [sbAlarmAtts, setSbAlarmAtts] = useState([]);
  const handleSave = () => {
    debugger;
    if (type === "conditionBased") {
      if (condition === "sensorBased") {
        let newRows = pRows.map((row) => {
          return { ...row, FailureModeId: failureMode };
        });
        let validAlarms = sbAlarmRows
          .filter((data) => {
            return !data.invalid;
          })
          .map((row) => row.id);
        saveSensor(
          {
            sData: newRows,
            lData: lvlwiseRows,
            aData: sbAlarmRows.filter((row) => {
              return !row.invalid;
            }),
            alarmAtts: sbAlarmAtts.filter((attrow) => {
              return validAlarms.includes(attrow.AlarmId);
            }),
          },
          setSnackBarMessage
        );
        console.log(validAlarms);
        console.log({
          sData: newRows,
          lData: lvlwiseRows,
          aData: sbAlarmRows.filter((row) => {
            return !row.invalid;
          }),
          alarmAtts: sbAlarmAtts.filter((attrow) => {
            return validAlarms.includes(attrow.AlarmId);
          }),
        });
      }
    }
  };

  const currentSelection = useSelector(
    (state) => state.userSelection.currentSelection
  );
  const systemData = useSelector((state) => state.treeData.treeData);
  const failureModes = useSelector((state) => state.treeData.failureModes);
  console.log("fffff", failureModes);
  const eqptId = systemData.filter(
    (data) => data.name === currentSelection.equipmentName
  )[0]?.id;

  const handleSubmit = () => {
    const payload = {
      nomenclature: CurrentSelected["nomenclature"],
      ship_name: CurrentSelected["shipName"],
    };

    if (matchingId) {
      payload.component_id = matchingId;
    }
    console.log(payload);
    fetch("/fetch_system", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((d) => {
        console.log(d);
        let treeD = d["treeD"];
        let failureModes = d["failureMode"];
        console.log(treeD[0]?.repairType);
        if (treeD) {
          setRtype(treeD[0]?.repairType);
        }
        dispatch(
          treeDataActions.setTreeData({
            treeData: treeD,
          })
        );
        dispatch(treeDataActions.setFailureModes(failureModes));
      });
    setSelectedEquipment(currentNomenclature);
  };
  return (
    <>
      <Navigation />
      <div className={styles.userSelection}>
        <UserSelection />
        <Button
          className={styles.btn}
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Submit
        </Button>
      </div>
      <div className={styles.assignDiv}>
        <div className={styles.assignContent}>
          <div className={styles.flex}>
            <h3>Selected Component:{selectedEquipment}</h3>
            <RadioGroup
              row
              name="maintenance-type"
              value={type}
              onChange={handleMtypeChange}
              className={styles.mtypeRadio}
            >
              {/* props.selectedComponent?.repairType === "Repairable" ||  */}
              {
                <FormControlLabel
                  value="runToFailure"
                  control={<Radio />}
                  label="Run to Failure"
                />
              }
              {Rtype == "Repairable" || (
                <FormControlLabel
                  value="ageBased"
                  control={<Radio />}
                  label="Age Based Maintenance"
                />
              )}
              {Rtype == "Repairable" || (
                <FormControlLabel
                  value="calendarBased"
                  control={<Radio />}
                  label="Calendar Based Maintenance"
                />
              )}
              {
                <FormControlLabel
                  value="conditionBased"
                  control={<Radio onClick={() => setModal(true)} />}
                  label="Condition Based Maintenance"
                />
              }
            </RadioGroup>
          </div>
          <div className={styles.btns}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
            {/* <Link to="/rul">
              <Button variant="contained" color="primary">
                RUL
              </Button>
            </Link> */}
            {/* <Link to="/optimize">
              <Button variant="contained" color="primary">
                Optimize
              </Button>
            </Link> */}
          </div>
        </div>
        {/* <Dialog open={modal} onClose={() => setModal(false)}>
          <div className={styles.modal}>
            <h4>Select Condition</h4>
            <RadioGroup
              name="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <FormControlLabel
                value="visual"
                control={<Radio />}
                label="Visual Inspection"
              />
              <FormControlLabel
                value="degradation"
                control={<Radio />}
                label="Degradation Measurement"
              />
              <FormControlLabel
                value="sensorBased"
                control={<Radio />}
                label="Sensor Based"
              />
            </RadioGroup>
          </div>
        </Dialog> */}
        {type === "runToFailure" && (
          <div className={styles.MTypeContent}>Run To Failure</div>
        )}
        {type === "ageBased" && (
          <div className={styles.MTypeContent}>
            <div className={styles.formField}>
              <label htmlFor="age-based-measurement-unit">
                {" "}
                Unit of Measurement
              </label>
              <Select
                disableUnderline
                labelId="age-based-measurement-unit-label"
                id="age-based-measurement-unit"
                value={ageBasedUnit}
                onChange={(e) => setAgeBasedUnit(e.target.value)}
                className={styles.input}
              >
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
                <MenuItem value="weeks">Weeks</MenuItem>
                <MenuItem value="months">Months</MenuItem>
                <MenuItem value="years">Years</MenuItem>
              </Select>
            </div>
            <div className={styles.formField}>
              <label htmlFor="age-based-replacement-age">
                {" "}
                Replacement Age
              </label>
              <input
                className={styles.input}
                type="text"
                id="age-based-replacement-age"
                name="age-based-replacement-age"
              />
            </div>
          </div>
        )}
        {type === "calendarBased" && (
          <div className={styles.MTypeContent}>
            <div className={styles.formField}>
              <label htmlFor="calendar-based-measurement-unit">
                {" "}
                Unit of Measurement
              </label>
              <Select
                disableUnderline
                labelId="calendar-based-measurement-unit-label"
                id="calendar-based-measurement-unit"
                value={calendarBasedUnit}
                onChange={(e) => setCalendarBasedUnit(e.target.value)}
                className={styles.input}
              >
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
                <MenuItem value="weeks">Weeks</MenuItem>
                <MenuItem value="months">Months</MenuItem>
                <MenuItem value="years">Years</MenuItem>
              </Select>
            </div>
            <div className={styles.formField}>
              <label htmlFor="calendar-based-replacement-age">
                {" "}
                Replacement Age
              </label>
              <input
                className={styles.input}
                type="text"
                id="calendar-based-replacement-age"
                name="calendar-based-replacement-age"
              />
            </div>
          </div>
        )}
        {type === "conditionBased" && (
          <div className={styles.MTypeContent}>
            <div className={styles.formField}>
              <label htmlFor="failure-mode">Failure Mode to be inspected</label>
              <Select
                disableUnderline
                labelId="failure-mode-label"
                id="failure-mode"
                value={failureMode}
                onChange={(e) => setFailureMode(e.target.value)}
                className={styles.input}
              >
                {failureModes?.map((ele) => {
                  return (
                    <MenuItem value={ele.failure_mode}>
                      {ele.failure_mode}
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
            {/* {condition === "visual" && (
              <>
                <div className={styles.formField}>
                  <label htmlFor="inspection-frequency">
                    {" "}
                    Inspection Frequency
                  </label>
                  <input
                    className={styles.input}
                    value={visualFrequency}
                    onChange={changeVisualFrequency}
                    type="number"
                    id="inspection-frequency"
                    name="inspection-frequency"
                  />
                </div>
                <div className={styles.levels}>
                  <div className={styles.levelCol}>
                    <div className={styles.sectionHead}>Wear</div>
                    <div className={styles.formField}>
                      <label htmlFor="visual-wear-level">No. of levels</label>
                      <input
                        className={styles.input}
                        value={visualWearLevels}
                        onChange={changeVisualWearLevel}
                        type="number"
                        id="visual-wear-level"
                        name="visual-wear-level"
                      />
                    </div>
                    <Table
                      columnDefs={visualWearColumnDefs}
                      rowData={VisualWearRows}
                      tableUpdate={(rows) => {
                        console.log(rows);
                      }}
                      height={250}
                    />
                  </div>
                  <div className={styles.levelCol}>
                    <div className={styles.sectionHead}>Corrosion</div>
                    <div className={styles.formField}>
                      <label htmlFor="visual-corrosion-level">
                        No. of levels
                      </label>
                      <input
                        className={styles.input}
                        value={visualCorrosionLevels}
                        onChange={changeVisualCorrosionLevel}
                        type="number"
                        id="visual-corrosion-level"
                        name="visual-corrosion-level"
                      />
                    </div>
                    <Table
                      columnDefs={visualCorrosionColumnDefs}
                      rowData={VisualCorrosionRows}
                      tableUpdate={(rows) => {
                        console.log(rows);
                      }}
                      height={250}
                    />
                  </div>
                </div>
                <div className={styles.levelwise}>
                  <div className={styles.lwCol}>
                    Actions
                    <Table
                      columnDefs={visualActionsCols}
                      rowData={visualActionsRows}
                      tableUpdate={(data) => console.log(data)}
                      height={200}
                    />
                  </div>
                </div>
              </>
            )}
            {condition === "degradation" && (
              <>
                <div className={styles.levels}>
                  <div className={styles.levelCol}>
                    <div className={styles.sectionHead}>Wear</div>
                    <div className={styles.sectionHead}>Corrosion</div>
                  </div>
                  <div className={styles.levelCol}>
                    <div className={styles.formField}>
                      <label htmlFor="degradation-wear-level">
                        No. of levels
                      </label>
                      <input
                        className={styles.input}
                        value={degradationWearLevels}
                        onChange={changeDegradationWearLevel}
                        type="number"
                        id="degradation-wear-level"
                        name="degradation-wear-level"
                      />
                    </div>
                    <div className={styles.formField}>
                      <label htmlFor="degradation-corrosion-level">
                        No. of levels
                      </label>
                      <input
                        className={styles.input}
                        type="text"
                        id="degradation-corrosion-level"
                        name="degradation-corrosion-level"
                      />
                    </div>
                  </div>
                  <div className={styles.levelCol}></div>
                </div>
              </>
            )} */}
            {condition === "sensorBased" && (
              <>
                <RadioGroup
                  row
                  name="monitoring-type"
                  value={monitoringType}
                  onChange={(e) => setMonitoringType(e.target.value)}
                  className={styles.sensorRadio}
                >
                  <div>
                    <FormControlLabel
                      labelPlacement="start"
                      value="intermittent"
                      control={<Radio />}
                      label="Intermittent Monitoring"
                    />
                  </div>
                  <FormControlLabel
                    labelPlacement="start"
                    value="continuous"
                    control={<Radio />}
                    label="Continuous Monitoring"
                  />
                </RadioGroup>
                <div className={styles.parameters}>
                  <div className={styles.formField}>
                    <label htmlFor="parameters"> Number of parameters</label>
                    <input
                      className={styles.input}
                      value={numPara}
                      onChange={(e) => setNumPara(e.target.value)}
                      type="number"
                      id="parameters"
                      name="parameters"
                    />
                    <Button
                      onClick={() => addPRows(numPara)}
                      variant="contained"
                      color="primary"
                      style={{ marginLeft: 10 }}
                    >
                      Generate Rows
                    </Button>
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="parameters"> Define parameters</label>
                    <Table
                      columnDefs={parameterColumnDefs}
                      rowData={pRows}
                      tableUpdate={updateParameterRowData}
                      height={200}
                    />
                  </div>
                  <div className={styles.FooterClass}>
                    <div className={styles.importBtnContainer}>
                      <Link to="/maintenance_allocation/add_data">
                        <Button variant="contained" color="primary">
                          Add Sensor Data
                        </Button>
                      </Link>
                    </div>
                    <div className={styles.importBtnContainer}>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        style={{ display: "none" }}
                        ref={fileInputRef}
                      />
                      <Button
                        className={classes.buttons}
                        variant="contained"
                        color="primary"
                        style={{ marginTop: "50px" }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        Import File
                      </Button>
                    </div>
                    <div className={styles.importBtnContainer}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={downloadBlankCSV}
                        style={{ marginTop: "50px" }}
                      >
                        Download Blank CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {SnackBarMessage.showSnackBar && (
        <CustomizedSnackbars
          message={SnackBarMessage}
          onHandleClose={onHandleSnackClose}
        />
      )}
    </>
  );
};
export default AssignType;
