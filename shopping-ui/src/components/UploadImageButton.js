// src/components/UploadImageButton.jsx
import React from "react";

const UploadImageButton = ({ setUploadedImage }) => {
  // const handleUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) setUploadedImage(file);
  // };

  return (
    <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200 flex items-center gap-2">
      🖼️ Upload Image
      <input
        type="file"
        accept="image/*"
        // onChange={handleUpload}
        className="hidden"
      />
    </label>

  );
};

export default UploadImageButton;
