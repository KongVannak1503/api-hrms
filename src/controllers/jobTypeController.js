const JobType = require("../models/JobType");

exports.getJobTypes = async (req, res) => {
    try {
        const job_types = await JobType.find().populate('createdBy', 'username');
        res.json(job_types);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.getJobType = async (req, res) => {
    const { id } = req.params;
    try {
        const job_type = await JobType.findById(id);
        if (!job_type) return res.status(404).json({ message: "Job type not found" });

        res.json(job_type);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
}

exports.createJobType = async (req, res) => {
    const { title, description, isActive } = req.body;
    try {
        console.log(req.body);

        if (!title) {
            return res.status(400).json({ message: "Title field is required" });
        }

        const createJobType = new JobType({ title, description, isActive, createdBy: req.user.id });
        await createJobType.save();
        await createJobType.populate('createdBy', 'username');

        res.status(201).json({ message: 'success', data: createJobType });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateJobType = async (req, res) => {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    console.log(isActive);

    try {
        let getJobType = await JobType.findById(id);
        if (!getJobType) return res.status(404).json({ message: "Job type not found" });

        if (!title) return res.status(400).json({ message: "Title field is required" });

        let updateJobType = await JobType.findByIdAndUpdate(
            id,
            { title, description, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateJobType });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteJobType = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteJobType = await JobType.findByIdAndDelete(id);
        if (!deleteJobType) return res.status(404).json({ message: "Job type not found" });

        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
