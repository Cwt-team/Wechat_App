package com.zking.ssm.wxcontroller;
 
/**
 * @Autho donkee
 * @Since 2022/6/27
 */
 
import cn.binarywang.wx.miniapp.bean.WxMaPhoneNumberInfo;
import com.alibaba.fastjson.JSONObject;
import com.zking.ssm.annotation.LoginUser;
import com.zking.ssm.model.UserInfo;
import com.zking.ssm.model.WxLoginInfo;
import com.zking.ssm.model.WxUser;
import com.zking.ssm.service.UserToken;
import com.zking.ssm.service.UserTokenManager;
import com.zking.ssm.service.WxUserService;
import com.zking.ssm.util.JacksonUtil;
import com.zking.ssm.util.ResponseUtil;
import com.zking.ssm.util.UserTypeEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
 
import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaJscode2SessionResult;
import javax.servlet.http.HttpServletRequest;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
 
/**
 * 鉴权服务
 */
@Slf4j
@RestController
@RequestMapping("/wx/auth")
public class WxAuthController {
    @Autowired
    private WxMaService wxService;
    @Autowired
    private WxUserService userService;
    /**
     * 微信登录
     *
     * @param wxLoginInfo
     *            请求内容，{ code: xxx, userInfo: xxx }
     * @param request
     *            请求对象
     * @return 登录结果
     */
    @PostMapping("login_by_weixin")
    public Object loginByWeixin(@RequestBody WxLoginInfo wxLoginInfo, HttpServletRequest request) {
 
        //客户端需携带code与userInfo信息
        String code = wxLoginInfo.getCode();
        UserInfo userInfo = wxLoginInfo.getUserInfo();
        if (code == null || userInfo == null) {
            return ResponseUtil.badArgument();
        }
        //调用微信sdk获取openId及sessionKey
        String sessionKey = null;
        String openId = null;
        try {
            long beginTime = System.currentTimeMillis();
            //
            WxMaJscode2SessionResult result = this.wxService.getUserService().getSessionInfo(code);
//            Thread.sleep(6000);
            long endTime = System.currentTimeMillis();
            log.info("响应时间:{}",(endTime-beginTime));
            sessionKey = result.getSessionKey();//session id
            openId = result.getOpenid();//用户唯一标识 OpenID
        } catch (Exception e) {
            e.printStackTrace();
        }
 
        if (sessionKey == null || openId == null) {
            log.error("微信登录,调用官方接口失败：{}", code);
            return ResponseUtil.fail();
        }else{
            log.info("openId={},sessionKey={}",openId,sessionKey);
        }
        //根据openId查询wx_user表
        //如果不存在，初始化wx_user,并保存到数据库中
        //如果存在，更新最后登录时间
        WxUser user = userService.queryByOid(openId);
 
        if (user == null) {
            user = new WxUser();
            user.setUsername(openId);
            user.setPassword(openId);
            user.setWeixinOpenid(openId);
            user.setAvatar(userInfo.getAvatarUrl());
            user.setNickname(userInfo.getNickName());
            user.setGender(userInfo.getGender());
            user.setUserLevel((byte) 0);
            user.setStatus((byte) 0);
            user.setLastLoginTime(new Date());
            user.setLastLoginIp(IpUtil.client(request));
            user.setShareUserId(1);
 
            userService.add(user);
 
        } else {
            user.setLastLoginTime(new Date());
            user.setLastLoginIp(IpUtil.client(request));
            if (userService.updateById(user) == 0) {
                log.error("修改失败：{}", user);
                return ResponseUtil.updatedDataFailed();
            }
        }
        // token
        UserToken userToken = null;
        try {
            userToken = UserTokenManager.generateToken(user.getId());
        } catch (Exception e) {
            log.error("微信登录失败,生成token失败：{}", user.getId());
            e.printStackTrace();
            return ResponseUtil.fail();
        }
        userToken.setSessionKey(sessionKey);
        log.info("SessionKey={}",UserTokenManager.getSessionKey(user.getId()));
        Map<Object, Object> result = new HashMap<Object, Object>();
        result.put("token", userToken.getToken());
        result.put("tokenExpire", userToken.getExpireTime().toString());
        userInfo.setUserId(user.getId());
        if (!StringUtils.isEmpty(user.getMobile())) {// 手机号存在则设置
            userInfo.setPhone(user.getMobile());
        }
        try {
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            String registerDate = df.format(user.getAddTime() != null ? user.getAddTime() : new Date());
            userInfo.setRegisterDate(registerDate);
            userInfo.setStatus(user.getStatus());
            userInfo.setUserLevel(user.getUserLevel());// 用户层级
            userInfo.setUserLevelDesc(UserTypeEnum.getInstance(user.getUserLevel()).getDesc());// 用户层级描述
        } catch (Exception e) {
            log.error("微信登录：设置用户指定信息出错："+e.getMessage());
            e.printStackTrace();
        }
        result.put("userInfo", userInfo);
 
 
        log.info("【请求结束】微信登录,响应结果:{}", JSONObject.toJSONString(result));
 
        return ResponseUtil.ok(result);
    }
    /**
     * 绑定手机号码
     *
     * @param userId
     * @param body
     * @return
     */
    @PostMapping("bindPhone")
    public Object bindPhone(@LoginUser Integer userId, @RequestBody String body) {
        log.info("【请求开始】绑定手机号码,请求参数，body:{}", body);
 
        String sessionKey = UserTokenManager.getSessionKey(userId);
        String encryptedData = JacksonUtil.parseString(body, "encryptedData");
        String iv = JacksonUtil.parseString(body, "iv");
        WxMaPhoneNumberInfo phoneNumberInfo = null;
        try {
            phoneNumberInfo = this.wxService.getUserService().getPhoneNoInfo(sessionKey, encryptedData, iv);
        } catch (Exception e) {
            log.error("绑定手机号码失败,获取微信绑定的手机号码出错：{}", body);
            e.printStackTrace();
            return ResponseUtil.fail();
        }
        String phone = phoneNumberInfo.getPhoneNumber();
        WxUser user = userService.selectByPrimaryKey(userId);
        user.setMobile(phone);
        if (userService.updateById(user) == 0) {
            log.error("绑定手机号码,更新用户信息出错,id：{}", user.getId());
            return ResponseUtil.updatedDataFailed();
        }
        Map<Object, Object> data = new HashMap<Object, Object>();
        data.put("phone", phone);
 
        log.info("【请求结束】绑定手机号码,响应结果：{}", JSONObject.toJSONString(data));
        return ResponseUtil.ok(data);
    }
    /**
     * 注销登录
     */
    @PostMapping("logout")
    public Object logout(@LoginUser Integer userId) {
        log.info("【请求开始】注销登录,请求参数，userId:{}", userId);
        if (userId == null) {
            return ResponseUtil.unlogin();
        }
        try {
            UserTokenManager.removeToken(userId);
        } catch (Exception e) {
            log.error("注销登录出错：userId:{}", userId);
            e.printStackTrace();
            return ResponseUtil.fail();
        }
 
        log.info("【请求结束】注销登录成功!");
        return ResponseUtil.ok();
    }
}