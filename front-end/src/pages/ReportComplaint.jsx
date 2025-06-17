import React, { useState, useRef } from 'react';
import { Button, Box, TextField, FormControlLabel, Checkbox, RadioGroup, Radio, ButtonBase } from '@mui/material';
import { LocationSearching } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { identifyLocation } from '../utils/MiscFunctions';
import { createComplaint } from '../utils/mongodb';
import { Statuses } from '../utils/enums';
import SpinnerModal from '../components/SpinnerModal';

const ReportComplaint = () => {
  const [formData, setFormData] = useState({
    location: {
      type: 'Point',
      coordinates: [0, 0], // Default coordinates
      name: '',
    },
    reason: '',
    additionalInfo: '',
    mediaType: '',
    reportedBy: '',
    status: Statuses.inProgress,
    mediaPath: '',
  });
  const [media, setMedia] = useState(null);
  const [mediaPath, setMediaPath] = useState('');
  const [loaderVisible, setLoaderVisible] = useState(false);
  const fileInput = useRef(null);
  const navigate = useNavigate();

  const handleLocationChange = async () => {
    try {
      const location = await identifyLocation();
      setFormData((prev) => ({
        ...prev,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
          name: location.name,
        },
      }));
    } catch (error) {
      toast.error('Failed to fetch location');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type.split('/')[0];
    if (!['image', 'video'].includes(fileType)) {
      toast.error('Invalid file type selected.');
      return;
    }

    setMedia(file);
    setFormData((prev) => ({
      ...prev,
      mediaType: fileType,
    }));

    try {
      const objectURL = URL.createObjectURL(file);
      setMediaPath(objectURL);
    } catch (error) {
      toast.error('Could not process selected file.');
      console.error(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoaderVisible(true);

    createComplaint(formData, media)
      .then(() => {
        toast.success('Complaint Reported Successfully');
        setTimeout(() => {
          navigate('/citizen-dashboard');
        }, 3000);
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to submit complaint');
      })
      .finally(() => {
        setLoaderVisible(false);
      });
  };

  return (
    <div className="overflow-x-hidden">
      <SpinnerModal visible={loaderVisible} />
      <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar pauseOnHover theme="light" />
      <h2 className="lg:mt-10 leading-normal font-bold text-center text-xl lg:text-[2rem] my-6 lg:text-left lg:mx-20">
        Report a Complaint
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          required
          type="file"
          ref={fileInput}
          className="opacity-0"
          accept="image/*,video/*"
          capture="environment"
          onChange={handleFileChange}
        />

        <div
          onClick={() => fileInput.current.click()}
          className="p-4 m-4 bg-slate-300 inline-flex justify-center items-center cursor-pointer font-bold"
        >
          IMAGE +
        </div>

        {media && (
          <div className="flex flex-col justify-center items-center mx-8 lg:mx-20 py-6">
            {formData.mediaType === 'image' && (
              <img src={mediaPath} alt="Selected" className="max-w-full w-auto my-6 h-96 object-scale-down" />
            )}
            {formData.mediaType === 'video' && (
              <video controls src={mediaPath} className="max-w-full w-auto my-6 h-96 object-scale-down" />
            )}
            <Button onClick={() => fileInput.current.click()} variant="outlined">
              Change Media
            </Button>
          </div>
        )}

        <Box ml="8vw">
          <TextField
            variant="outlined"
            label="Location"
            value={formData.location.name}
            required
            InputProps={{
              readOnly: true,
              endAdornment: (
                <ButtonBase onClick={handleLocationChange}>
                  <LocationSearching />
                </ButtonBase>
              ),
            }}
          />

          <p className="mt-6">Reason:</p>
          <RadioGroup
            onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
            value={formData.reason}
          >
            <FormControlLabel value="Streetlight Not Working" control={<Radio />} label="Streetlight Not Working" />
            <FormControlLabel value="Dirty Water Flow on Road" control={<Radio />} label="Dirty Water Flow on Road" />
            <FormControlLabel value="Garbage Dumped on Road" control={<Radio />} label="Garbage Dumped on Road" />
            <FormControlLabel value="Open Manhole" control={<Radio />} label="Open Manhole" />
            <FormControlLabel value="Broken Footpath" control={<Radio />} label="Broken Footpath" />
            <FormControlLabel value="Water Leakage" control={<Radio />} label="Water Leakage" />
            <FormControlLabel value="Others" control={<Radio />} label="Others" />
          </RadioGroup>

          <p className="my-2">More Information</p>
          <TextField
            type="text"
            required
            multiline
            value={formData.additionalInfo}
            onChange={(e) => setFormData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
            rows={5}
            placeholder="Provide more information about the incident"
            inputProps={{
              pattern: ".*",
            }}
          />

          <FormControlLabel
            required
            control={<Checkbox />}
            label="By clicking this checkbox, I understand that reporting fake complaints against anyone may lead to legal actions against me."
          />
        </Box>

        <div className="flex justify-center my-8 px-40 lg:px-96">
          <Button variant="contained" fullWidth type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReportComplaint;
