export default function DebugPage() {
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">Debug Page</h1>
            <p>If you see this, the deployment is working.</p>
            <p>Path: /debug</p>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    );
}
