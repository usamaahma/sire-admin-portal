// components/CloudinaryUploader.js
import React, { useState } from "react";
import axios from "axios";
import { Spin, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const CloudinaryUploader = ({
  onUploadSuccess,
  uploadPreset,
  cloudName,
  buttonText = "Upload Image",
  className,
  listType = "text", // 'text' or 'picture-card'
  maxCount = 1,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const uploadImage = async (file) => {
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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

      const imageUrl = response.data.secure_url;

      const updated = [...uploadedUrls, imageUrl].slice(-maxCount);
      setUploadedUrls(updated);

      onUploadSuccess(response.data);
      return imageUrl;
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload image");
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
        return await uploadImage(file);
      } catch (error) {
        return null;
      }
    }
  };

  const removeImage = (url) => {
    setUploadedUrls(uploadedUrls.filter((u) => u !== url));
  };

  if (listType === "picture-card") {
    return (
      <div className={`cloudinary-uploader ${className || ""}`}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {uploadedUrls.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                width: 100,
                height: 100,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <img
                src={url}
                alt="uploaded"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <DeleteOutlined
                onClick={() => removeImage(url)}
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

          {uploadedUrls.length < maxCount && (
            <label className="upload-button">
              <input
                type="file"
                accept="image/*"
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
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      {buttonText}
                    </div>
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
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={isUploading || disabled}
        />
        {isUploading ? `Uploading... ${progress}%` : buttonText}
      </label>
      {uploadedUrls.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <img
            src={uploadedUrls[0]}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: 150 }}
          />
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploader;
