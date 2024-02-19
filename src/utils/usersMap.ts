class UsersMap {
    private onlineUsers: Map<string, string>;

    constructor() {
        this.onlineUsers = new Map<string, string>()
    }

    get availableUsersCount() {
        return this.onlineUsers.size;
    }
    
    getUserStatus(id: string) {
        return this.onlineUsers.has(id)
    }

    set addUser(props: { id: string, value: string }) {
        if(!this.onlineUsers.has(props.id)) {
            this.onlineUsers.set(props.id, props.value)
        }
    }

    deleteUser(id: string) {
        if(this.onlineUsers.has(id)) {
            this.onlineUsers.delete(id)
        }
    }
}

// * Intialize Global Users Online Registry
export const usersRegistry = new UsersMap();

export default UsersMap