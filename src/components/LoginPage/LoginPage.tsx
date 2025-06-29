import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      await signIn(values.email, values.password);
      messageApi.success('登入成功');
      navigate('/', { replace: true });
    } catch (error: any) {
      messageApi.error('登入失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-container">
      {contextHolder}
      <div className="login-box">
        <Form

          name="login"
          onFinish={handleLogin}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="電子郵件"
            rules={[
              { required: true, message: '請輸入電子郵件' },
              { type: 'email', message: '請輸入有效的電子郵件' }
            ]}
          >
            <Input placeholder="請輸入電子郵件" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密碼"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password 
              placeholder="請輸入密碼"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登入
            </Button>
          </Form.Item>

          <Button
            type="link"
            onClick={() => navigate('/create-account')}
            disabled={loading}
            block
          >
            註冊新帳號
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
