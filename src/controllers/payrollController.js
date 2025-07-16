const Payroll = require("../models/Payroll");
const Bonus = require("../models/Bonus");
const SubBonus = require("../models/SubBonus");
const Employee = require("../models/Employee");

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


// Get all Bonus
exports.getBonuses = async (req, res) => {
    try {
        const getBonus = await Bonus.find().populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getBonus);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getBonus = async (req, res) => {
    const { id } = req.params;
    try {
        const getBonus = await Bonus.findById(id);
        if (!getBonus) return res.status(404).json({ message: "Bonus not found" });
        res.json(getBonus);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createBonus = async (req, res) => {
    const {
        payDate
    } = req.body;
    try {
        const createBonus = new Bonus({
            payDate, createdBy: req.user.id
        });
        await createBonus.save();
        await createBonus.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createBonus });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateBonus = async (req, res) => {
    const { id } = req.params;
    const { payDate } = req.body;
    try {
        let getBonus = await Bonus.findById(id);

        if (!getBonus) return res.status(404).json({ message: "Payroll not found" });

        let updateBonus = await Bonus.findByIdAndUpdate(
            id,
            { payDate, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateBonus });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteBonus = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteBonus = await Bonus.findByIdAndDelete(id);
        if (!deleteBonus) return res.status(404).json({ message: "Bonus not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

// Sub Bonus Create or Update
exports.createSubBonus = async (req, res) => {
    console.log("body", req.body);
    const { id } = req.params; // employeeId
    const {
        bonusId,
        isSix,
        isTwelve,
        isSixTotal = 0,
        isTwelveTotal = 0,
    } = req.body;

    try {
        const calcTotal = (Number(isSixTotal) || 0) + (Number(isTwelveTotal) || 0);

        // Step 1: Find employee
        const employee = await Employee.findById(id).populate('subBonus');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Step 2: Check if subBonus with same bonusId already exists
        const existingSubBonus = employee.subBonus.find(
            sb => String(sb.bonusId) === String(bonusId)
        );

        let subBonusRecord;

        if (existingSubBonus) {
            // ✅ Update existing subBonus
            subBonusRecord = await SubBonus.findByIdAndUpdate(
                existingSubBonus._id,
                {
                    isSix,
                    isTwelve,
                    isSixTotal,
                    isTwelveTotal,
                    total: calcTotal,
                    updatedBy: req.user.id
                },
                { new: true }
            ).populate('createdBy', 'username');
        } else {
            // ✅ Create new subBonus
            subBonusRecord = new SubBonus({
                bonusId,
                isSix,
                isTwelve,
                isSixTotal,
                isTwelveTotal,
                total: calcTotal,
                createdBy: req.user.id
            });

            await subBonusRecord.save();

            // Push new subBonus into employee
            await Employee.findByIdAndUpdate(id, {
                $push: { subBonus: subBonusRecord._id }
            });
        }

        res.status(200).json({
            message: existingSubBonus ? 'Updated successfully' : 'Created successfully',
            data: subBonusRecord
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};