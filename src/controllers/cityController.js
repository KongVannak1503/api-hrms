const City = require("../models/City");

// Get all 
exports.getCities = async (req, res) => {
    try {
        const getCities = await City.find().populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getCities);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getCity = async (req, res) => {
    const { id } = req.params;
    try {
        const getCity = await City.findById(id);
        if (!getCity) return res.status(404).json({ message: "City not found" });
        res.json(getCity);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createCity = async (req, res) => {
    const { name, isActive } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: "name field is required" });
        }

        const createCity = new City({ name, isActive, createdBy: req.user.id });
        await createCity.save();
        await createCity.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createCity });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateCity = async (req, res) => {
    const { id } = req.params;
    const { name, isActive } = req.body;
    try {
        let getCity = await City.findById(id);
        if (!getCity) return res.status(404).json({ message: "City not found" });

        if (!name) return res.status(400).json({ message: "name field is required" });

        let updateCity = await City.findByIdAndUpdate(
            id,
            { name, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateCity });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteCity = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteCity = await City.findByIdAndDelete(id);
        if (!deleteCity) return res.status(404).json({ message: "City not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}