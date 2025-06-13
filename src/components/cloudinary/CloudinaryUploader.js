import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spin, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const CloudinaryUploader = ({
  onUploadSuccess,
  uploadPreset,
  cloudName,
  buttonText = "Upload Image/Video",
  className,
  listType = "text", // 'text' or 'picture-card'
  maxCount = 1,
  disabled = false,
  fileList = [], // Required fileList prop
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Debug: Log fileList prop
  useEffect(() => {
    console.log("CloudinaryUploader fileList:", fileList);
  }, [fileList]);

  const uploadFile = async (file) => {
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, // 'auto' for automatic handling of file type
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      const fileUrl = response.data.secure_url;

      // Create file object in Ant Design fileList format
      const newFile = {
        uid: `-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name || "file.mp4", // Default name if not provided
        status: "done",
        url: fileUrl,
        thumbUrl: fileUrl,
        type: file.type, // Store file type (image/video)
      };

      // Update fileList with new file, respecting maxCount
      const updatedFileList = [...fileList, newFile].slice(-maxCount);
      onUploadSuccess(updatedFileList);

      return fileUrl;
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload file");
      throw error;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadFile(file);
      } catch (error) {
        // Error already handled in uploadFile
      }
    }
  };

  const removeFile = (file) => {
    const updatedFileList = fileList.filter((f) => f.uid !== file.uid);
    onUploadSuccess(updatedFileList); // Notify parent to update form
  };

  const renderPreview = (file) => {
    if (file.type.includes("image")) {
      return <img src={file.url} alt="uploaded" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
    }
    if (file.type.includes("video")) {
      return (
        <video controls style={{ width: "100%", height: "100%" }}>
          <source src={file.url} type={file.type} />
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };

  if (listType === "picture-card") {
    return (
      <div className={`cloudinary-uploader ${className || ""}`}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {fileList.map((file) => (
            <div
              key={file.uid}
              style={{
                position: "relative",
                width: 100,
                height: 100,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {renderPreview(file)}
              <DeleteOutlined
                onClick={() => removeFile(file)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  color: "#f5222d",
                  background: "white",
                  borderRadius: "50%",
                  padding: 4,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              />
            </div>
          ))}

          {fileList.length < maxCount && (
            <label className="upload-button">
              <input
                type="file"
                accept="image/*,video/*" // Allow both image and video files
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={isUploading || disabled}
              />
              <div
                style={{
                  width: 100,
                  height: 100,
                  border: "1px dashed #d9d9d9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
              >
                {isUploading ? (
                  <Spin tip={`${progress}%`} />
                ) : (
                  <>
                    <PlusOutlined />
                    <div style={{ fontSize: 12, marginTop: 4 }}>{buttonText}</div>
                  </>
                )}
              </div>
            </label>
          )}
        </div>
      </div>
    );
  }

  // Fallback: Text style uploader
  return (
    <div className={`cloudinary-uploader ${className || ""}`}>
      <label className="upload-button">
        <input
          type="file"
          accept="image/*,video/*" // Allow both image and video files
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={isUploading || disabled}
        />
        {isUploading ? `Uploading... ${progress}%` : buttonText}
      </label>
      {fileList.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {renderPreview(fileList[0])}
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploader;
