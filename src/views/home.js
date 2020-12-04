import mixins from "../mixin";

export default {
    name: "home",
    mixins: [mixins],
    created() {
        this.selected = 'home'
    }
};