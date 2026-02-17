export default function Grid() {
    return (
        <gridHelper
            args={[20, 20, 0x444444, 0x222222]}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
        />
    );
}
