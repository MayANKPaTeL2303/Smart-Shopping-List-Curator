function UploadImageButton({ setUploadedImage }) {
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
    }
  };

  return (
    <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block">
      📷 Upload Image
      <input type="file" accept="image/*" onChange={handleImageChange} hidden />
    </label>
  );
}

export default UploadImageButton;
