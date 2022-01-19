module.exports = {
    apps: [{
        name: 'molink-hierarchy-live',
        script: 'build/app.js',
        node_args: '--max_old_space_size=1024',
        error_file: '/home/ubuntu/log/error.log',
        out_file: '/home/ubuntu/log/access.log'
    }]
}