import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import NavBar from '../Component/Navbar';
import JobInfo from '../Component/JobInfo';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import ChevronRight from '@mui/icons-material/ChevronRight'
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const ListParseItems = () =>
{
    const location = useLocation();
    const data = location.state.data;

    const bottomBox = () =>
    {
        return {
            margin: " 10px 0 0 0",
            display: "flex",
            flexDirection: "row-reverse"
        }
    }

    const btnStyle = () =>
    {
        return {
            margin: "0 10px 0 10px",
            height: "100%",
            bgcolor: "#461d5c",
            '&:hover': {
                bgcolor: "#6a2b8c",
            }
        }
    }



    let navigate = useNavigate()

    const token = sessionStorage.getItem('token');



    const [parseData, setParseData] = useState(data);
    const [failedData, setFailedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState({});
    const [notSelectedRows, setNotSelectedRows] = useState({});
    const [loadingProfileCreate, setLoadingProfileCreate] = useState(false)
    const [profileClick, setProfileClick] = useState(0)
    const [open, setOpen] = useState(false);
    const [dataToSend, setDataToSend] = useState({})






    const dataWithTempKey = parseData.map((candidate, index) =>
    {
        return {
            ...candidate,
            tempKey: parseInt(index, 10), // generate temporary key using the index
        };
    });

    useEffect(() =>
    {
        if (!token)
        {

            navigate(`/login`);
        }
        try
        {
            const failedRows = dataWithTempKey.filter((row) => !row.email || !row.firstName || !row.lastName || (row.email === "No Email") || (row.firstName === "No Name") || (row.lastName === "No Name"));
            setFailedData(failedRows);
            const successfulRows = dataWithTempKey.filter((row) => row.email && row.firstName && row.lastName && (row.email !== "No Email") && (row.firstName !== "No Name") && (row.lastName !== "No Name"));
            setParseData(successfulRows);
            setLoading(false);
        } catch (error)
        {

        }
    }, [])


    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) =>
    {
        setExpanded(isExpanded ? panel : false);
    };

    const handleEdit = (id) =>
    {
        navigate(`/edit/${id}`);
    };

    const handleDelete = (id, firstName) =>
    {
        try
        {
            if (window.confirm(`Are you sure you want to delete profile: ${firstName}?`))
            {
                fetch(process.env.REACT_APP_PARSE_URL + `/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },

                })
                    .then((res) => res.json())
                    .then(data =>
                    {
                        setParseData([...parseData, data])
                        setParseData("")
                    })
            }
        } catch (error)
        {
            setError(error.message);
        }
    }

    const handleCreation = (selectedRows) =>
    {
        if (Object.keys(selectedRows).length == 0)
        {
            alert("Please select profiles to be created")
        } else
        {
            setLoadingProfileCreate(true)
            console.log(selectedRows + "SELECTED")
            console.log(notSelectedRows + "NOT SELECTED")
            // const selectedTempKeys = selectedRows.map((row) => row.tempKey);
            // console.log(selectedTempKeys)
            const selectedRowsWithoutTempKeys = selectedRows.map(({ tempKey, ...rest }) => rest);
            console.log(selectedRowsWithoutTempKeys)

            const headers = {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                'Content-Type': 'application/json',
            };

            fetch("http://localhost:8080/cvparser/cand", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(selectedRowsWithoutTempKeys),
            }).then((response) =>
            {
                if (response.ok)
                {
                    console.log(response)
                    response.json().then((data) =>
                    {
                        console.log(data)
                        setParseData(notSelectedRows)
                        setLoadingProfileCreate(false)
                        setProfileClick(profileClick + 1)
                        setDataToSend(data)

                    })
                } else
                {
                    // Handle other errors
                }
            })
                .catch((error) =>
                {
                    alert("Profile creation failed");
                });

        }
    }


    const handleCancel = () =>
    {
        navigate(-1)
    }

    const columns = [


        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            width: 140,
            valueGetter: (params) =>
                `${params.row.firstName || ''} ${params.row.lastName || ''}`,
        },

        {
            field: 'email',
            headerName: 'Email',
            width: 220,
        },

        {
            field: 'phoneNumber',
            headerName: 'Contact',
            width: 120,
        },

        {
            field: 'createdOn',
            headerName: 'Date Uploaded',
            width: 180,
            valueGetter: (params) =>
                new Date(params.row.createdOn).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                }),
        },

        {
            field: 'edit',
            headerName: '',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <button
                    className='btn btn-sm btn-primary'
                    onClick={() => handleEdit(params.row.tempKey)}
                >
                    Edit
                </button>
            ),
        },
        {
            field: 'delete',
            headerName: '',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <button
                    className='btn btn-sm btn-danger'
                    onClick={() => handleDelete(params.row.tempKey, params.row.firstName)}
                >
                    Delete
                </button>
            ),
        },
    ];


    const handleSelection = (ids) =>
    {
        const selectedIDs = new Set(ids);
        const selectedRowData = parseData.filter((row) =>
            selectedIDs.has(row.tempKey));
        setSelectedRows(selectedRowData);

        const notSelectedRowData = parseData.filter((row) =>
            !selectedIDs.has(row.tempKey));
        setNotSelectedRows(notSelectedRowData)
    };
    const handleClickOpen = () =>
    {
        setOpen(true);
    };

    const handleClose = () =>
    {
        setOpen(false);
    };

    const handleFinish = () => 
    {
        console.log(dataToSend)
    navigate("/export", { state: { dataToSend } })
    }


    return (
        <div>
            <NavBar />
            <h1>Parsing Results</h1>

            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary style={{ backgroundColor: 'lightblue' }} aria-controls="panel1-content" id="panel1-header" expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">{loading ? "Loading information..." : `${parseData.length} File(s) Successful Parsing`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography component="span">
                        {loading ? (
                            'Fetching profiles...'
                        ) : (
                            <div style={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    getRowId={(row) => row.tempKey}
                                    rows={parseData}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    checkboxSelection
                                    onRowSelectionModelChange={handleSelection}
                                />
                            </div>
                        )}
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                <AccordionSummary style={{ backgroundColor: 'lightblue' }} aria-controls="panel2-content" id="panel2-header" expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">{loading ? "Loading information..." : `${failedData.length} File(s) Failed Parsing - Need More Information`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography component="span">
                        {loading ? (
                            'Fetching profiles...'
                        ) : (
                            <div style={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    getRowId={(row) => row.tempKey}
                                    rows={failedData}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    checkboxSelection
                                />
                            </div>
                        )}
                    </Typography>
                </AccordionDetails>
            </Accordion>
            {error && (
                <Typography component="span" style={{ color: 'red' }}>
                    Items failed to parse: {error}
                </Typography>
            )}
            <br />
            <br />
            <JobInfo />
            <br />
            <Box sx={bottomBox}>
                <Button variant="contained" endIcon={<ChevronRight />}
                    size="large" sx={btnStyle} onClick={handleCancel}>
                    Cancel
                </Button>
            </Box>
            <Box sx={bottomBox}>

                <LoadingButton
                    variant="contained" endIcon={<ChevronRight />}
                    size="large"
                    sx={btnStyle}
                    onClick={() => handleCreation(selectedRows)}
                    loading={loadingProfileCreate}
                >
                    <span> Create Profiles</span>
                </LoadingButton>

            </Box>
            <Box sx={bottomBox}>
                <Button variant="contained" endIcon={<ChevronRight />} size="large" sx={btnStyle} disabled={profileClick <= 0} onClick={handleClickOpen}>
                    Finish
                </Button>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Finish Parsing CVs"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to proceed?
                            Any unsaved data will be permanently lost.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>No</Button>
                        <Button onClick={handleFinish} autoFocus>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );
};

export default ListParseItems;