import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import UploadButton from '../Component/UploadButton';
import SearchBox from '../Component/SearchBox';
import "../Component/UploadSearch.css"
import NavBar from '../Component/Navbar';
import ExportButton from '../Component/ExportButton';
import EditButton from "../Component/EditButton";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const Dashboard = () =>
{

    let navigate = useNavigate()

    const token = sessionStorage.getItem('token');


    

    const [parseData, setParseData] = useState([]);
    const [failedData, setFailedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState('');

    
    useEffect(() =>
    {
        if (!token)
        {
            navigate(`/login`);
        }
        
        try
        {
            fetch(process.env.REACT_APP_PARSE_URL, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data) =>
                {
                    console.log(data);
                    const failedRows = data.filter((row) => !row.email || !row.firstName || !row.lastName);
                    setFailedData(failedRows);
                    const successfulRows = data.filter((row) => row.email && row.firstName && row.lastName);
                    setParseData(successfulRows);
                    setLoading(false);
                });
        } catch (error)
        {

        }
    }, [])

    const candidatesWithTempKey = parseData.map((candidate, index) => {
        return {
          ...candidate,
          tempKey: `temp_${index}`, // generate temporary key using the index
        };
      });

    const filteredData = candidatesWithTempKey.filter(
        (row) =>
            row.email.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.phoneNumber.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.lastName.toLowerCase().includes(searchInput.toLowerCase())
    );

    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) =>
    {
        setExpanded(isExpanded ? panel : false);
    };

    function handleSave(tempKey, formData) {
      const index = filteredData.findIndex(candidate => candidate.tempKey === tempKey);
     
      if (index === -1) {
        console.error(`Candidate with tempKey ${tempKey} not found`);
        return;
      }
       const updatedCandidate = {
        ...filteredData[index],
        ...formData,
        tempKey: tempKey
      };
  
      let str2 = JSON.stringify(updatedCandidate, null, 4);
      console.log("stringify updatedCandidate:" + str2);

        candidatesWithTempKey[index] = updatedCandidate;

        let str3 = JSON.stringify(candidatesWithTempKey, null, 4);
        console.log("stringify candidatesWithTempKey:" + str3);



      fetch(process.env.REACT_APP_PARSE_URL + `/${updatedCandidate.id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCandidate)
      })
        .then(response => 
            console.log("response: " + JSON.stringify(response)))
        .then(data => {
        // update the data state with the new data
          return  setParseData(candidatesWithTempKey)
        })
        .catch(error => {
          console.error('Error updating data: ', error);
        });
    }
    

    const updateList = () =>
    {
        try
        {
            fetch(process.env.REACT_APP_PARSE_URL, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data) =>
                {
                    console.log(data);
                    const failedRows = data.filter((row) => !row.email || !row.firstName || !row.lastName);
                    setFailedData(failedRows);
                    const successfulRows = data.filter((row) => row.email && row.firstName && row.lastName);
                    setParseData(successfulRows);
                    setLoading(false);
                });
        } catch (error)
        {

        }
    }

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
                        updateList()
                    })
            }
        } catch (error)
        {
            setError(error.message);
        }
    }

    const handleSearch = (event) =>
    {
        setSearchInput(event.target.value);
    };

    const handleButton = () =>
    {
        navigate(`/upload`)
    }

    const columns = [


        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            width: 300,
            valueGetter: (params) =>
                `${params.row.firstName || ''} ${params.row.midName || ''} ${params.row.lastName || ''}`,
        },

        {
            field: 'email',
            headerName: 'Email',
            width: 300,
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
                <EditButton
                    className='btn btn-sm btn-primary'
                    candidate={params.row} onSave={handleSave}
                >
                    Edit
                </EditButton>
            ),
        },
        {
            field: 'delete',
            headerName: '',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <IconButton aria-label="delete"
                    className='btn btn-sm btn-danger'
                    onClick={() => handleDelete(params.row.id, params.row.firstName)}
                >
                     <DeleteIcon />
                </IconButton>
            ),
        },
    ];




    return (
        
        <div>
            <NavBar/>
            <h1>Dashboard</h1>
            <div className="button-container">
                <UploadButton handleButton={handleButton}/>
                <SearchBox handleSearch={handleSearch} />
            </div>

            <br></br>
                        {loading ? (
                            'Fetching profiles...'
                        ) : (
                            <div style={{ height: 500, width: '100%' }}>
                                <DataGrid
                                    rows={filteredData}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    checkboxSelection
                                />
                            </div>
                        )}
            <div className="export-button-container">
                <ExportButton />
            </div>
        

        </div>
    );
};

export default Dashboard;