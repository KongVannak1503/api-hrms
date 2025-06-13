const Category = require("../models/Category");

// Get all 
exports.getCategories = async (req, res) => {
    try {
        const getCategories = await Category.find().populate('createdBy', 'username');
        res.json(getCategories);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const getCategory = await Category.findById(id);
        if (!getCategory) return res.status(404).json({ message: "Category not found" });
        res.json(getCategory);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createCategory = async (req, res) => {
    const { title, description, isActive } = req.body;
    try {
        console.log(req.body);

        if (!title) {
            return res.status(400).json({ message: "Title field is required" });
        }

        const createCategory = new Category({ title, description, isActive, createdBy: req.user.id });
        await createCategory.save();
        await createCategory.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createCategory });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    try {
        let getCategory = await Category.findById(id);
        if (!getCategory) return res.status(404).json({ message: "Category not found" });

        if (!title) return res.status(400).json({ message: "Title field is required" });

        let updateCategory = await Category.findByIdAndUpdate(
            id,
            { title, description, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateCategory });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteCategory = await Category.findByIdAndDelete(id);
        if (!deleteCategory) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}