function UploadImageButton({ setUploadedImage }) {
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
    }
  };

  return (
    <label className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
      📸 Upload Image
      <input type="file" accept="image/*" onChange={handleImageChange} hidden />
    </label>
  );
}

export default UploadImageButton;
