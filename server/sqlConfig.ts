export class SqlConfig {
    server: string;
    user: string;
    password: string;
    database: string;
    constructor(server: string, user: string, pw: string, db: string) {
        this.server = server;
        this.user = user;
        this.password = pw;
        this.database = db; 
    }
}