import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import NavBar from '../Component/Navbar';
import SearchBox from '../Component/SearchBox';
import "../Component/UploadSearch.css"
import ExportButton from '../Component/ExportButton';

const ListProfileCreated = () =>
{

    let navigate = useNavigate()

    const token = sessionStorage.getItem('token');
    if (!token)
    {

        navigate(`/login`);
    }

    const [parseData, setParseData] = useState([]);
    const [failedData, setFailedData] = useState([]); //failed to parse in this case
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() =>
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

    const handleSearch = (event) =>
    {
        setSearchInput(event.target.value);
    };

    const filteredData = parseData.filter(
        (row) =>
            row.email.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.phoneNumber.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
            row.lastName.toLowerCase().includes(searchInput.toLowerCase())
    );

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

        // {
        //     field: 'createdOn',
        //     headerName: 'Date Uploaded',
        //     width: 180,
        // },

        {
            field: 'edit',
            headerName: '',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <button
                    className='btn btn-sm btn-primary'
                    onClick={() => handleEdit(params.row.id)}
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
                    onClick={() => handleDelete(params.row.id, params.row.firstName)}
                >
                    Delete
                </button>
            ),
        },
    ];




    return (
        <div>
            <NavBar />
            <h1>Profile Creation</h1>
          
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ marginRight: '10px' }}>
                    <SearchBox handleSearch={handleSearch} />
                </div>
            </div>
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary style={{ backgroundColor: 'lightblue' }} aria-controls="panel1-content" id="panel1-header" expandIcon={<ExpandMoreIcon />}>
                    <Typography>{loading ? "Loading information..." : `x / x Profiles Created`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        {loading ? (
                            'Fetching created profiles...'
                        ) : (
                            <div style={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={filteredData}
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
                <Typography style={{ color: 'red' }}>
                    Items failed to parse: {error}
                </Typography>
            )}
            <div className="export-button-container">
                <ExportButton />
            </div>
        </div>
    );
};

export default ListProfileCreated;