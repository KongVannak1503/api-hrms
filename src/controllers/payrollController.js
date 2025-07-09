const Payroll = require("../models/Payroll");

// Get all 
exports.getPayrolls = async (req, res) => {
    try {
        const getPayrolls = await Payroll.find().populate('employeeId', 'name_kh').populate('departmentId', 'title').populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getPayrolls);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getPayroll = async (req, res) => {
    const { id } = req.params;
    try {
        const getPayroll = await Payroll.findById(id);
        if (!getPayroll) return res.status(404).json({ message: "Payroll not found" });
        res.json(getPayroll);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createPayroll = async (req, res) => {
    const {
        departmentId,
        employeeId,
        payDate,
        status
    } = req.body;
    try {


        const createPayroll = new Payroll({
            departmentId,
            employeeId,
            status,
            payDate, createdBy: req.user.id
        });
        await createPayroll.save();
        await createPayroll.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createPayroll });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updatePayroll = async (req, res) => {
    const { id } = req.params;
    const { employeeId, isActive } = req.body;
    try {
        let getPayroll = await Payroll.findById(id);
        if (!getPayroll) return res.status(404).json({ message: "Payroll not found" });

        if (!employeeId) return res.status(400).json({ message: "employeeId field is required" });

        let updatePayroll = await Payroll.findByIdAndUpdate(
            id,
            { employeeId, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updatePayroll });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deletePayroll = async (req, res) => {
    const { id } = req.params;
    try {
        const deletePayroll = await Payroll.findByIdAndDelete(id);
        if (!deletePayroll) return res.status(404).json({ message: "Payroll not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}