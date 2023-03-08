import React, { useState } from "react";
import Modal from "react-modal";
import EditForm from "./EditForm";
import Button from "@mui/material/Button";
import EditIcon from '@mui/icons-material/Edit';
import "../css/Edit.css";

export default function EditButton({ candidate, onSave }) {
  const [isEditing, setIsEditing] = useState(false);

    //   let str = JSON.stringify(candidate, null, 4);
    //   console.log("stringify edit button candidate:" + str);
    //   let str1 = JSON.stringify(candidate.tempKey, null, 4);
    //   console.log("stringify edit button candidate.tempKey:" + str1);

  function handleSave(formData) {
    onSave(candidate.tempKey, formData);

    console.log("handlesave candidate.tempKey: " + candidate.tempKey)
    let str = JSON.stringify(formData, null, 4);
    console.log("stringify formData:" + str);

    setIsEditing(false);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  return (
    <div>
      <Button onClick={() => setIsEditing(true)}><EditIcon/></Button>
      <Modal 
        isOpen={isEditing}
        onRequestClose={handleCancel}
        ariaHideApp={false}
        contentLabel="Edit Candidate"
      >
        <EditForm data={candidate} onSave={handleSave} onCancel={handleCancel} />
      </Modal>
    </div>
  );
}
